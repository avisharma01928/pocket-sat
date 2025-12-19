
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { db, Question } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X, Lightbulb, Pencil, BookOpen, Calculator } from "lucide-react";
import { toast } from "sonner";

import Scratchpad from "@/components/Scratchpad";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

import { updateSRS, updateDifficulty } from "@/lib/srs";

const FORMULAS = [
  { name: "Pythagorean Theorem", formula: "a^2 + b^2 = c^2" },
  { name: "Area of Circle", formula: "A = \\pi r^2" },
  { name: "Circumference", formula: "C = 2 \\pi r" },
  { name: "Slope Intercept", formula: "y = mx + b" },
  { name: "Quadratic Formula", formula: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
];

const Practice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const subject = searchParams.get("subject"); // optional filter
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Load session
  useEffect(() => {
    const loadQuestions = async () => {
      // Check for custom session (e.g. from Review)
      if (location.state?.questionIds) {
        const customQuestions = await db.questions.bulkGet(location.state.questionIds);
        setQuestions(customQuestions.filter(q => q !== undefined) as Question[]);
        setLoading(false);
        return;
      }

      let all = await db.questions.toArray();
      if (subject) {
        all = all.filter(q => q.topic.toLowerCase() === subject.toLowerCase());
      }
      // Shuffle
      const shuffled = all.sort(() => 0.5 - Math.random()).slice(0, 10);
      setQuestions(shuffled);
      setLoading(false);
    };
    loadQuestions();
  }, [subject, location.state]);

  const handleAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_index;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      if (!hintUsed) {
        // XP logic could go here
      }
      toast.success("Correct!", { position: "top-center" });
    } else {
      toast.error("Incorrect", { position: "top-center" });
    }

    // Update SRS & Difficulty
    updateSRS(currentQuestion.id, isCorrect);
    updateDifficulty(currentQuestion.id, isCorrect);

    // Save attempt
    db.attempts.add({
      question_id: currentQuestion.id,
      is_correct: isCorrect,
      selected_answer: selectedAnswer,
      timestamp: Date.now(),
      time_taken_seconds: 0
    });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setHintUsed(false);
    } else {
      // Finish
      navigate("/dashboard"); // Or results page
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (questions.length === 0) return <div className="min-h-screen flex items-center justify-center">No questions found.</div>;

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative pb-20">
      {/* Top Bar */}
      <header className="px-4 py-3 flex items-center gap-4 border-b border-border bg-background z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <X className="w-5 h-5" />
        </Button>
        <Progress value={progress} className="h-2 flex-1 bg-secondary" indicatorClassName="bg-primary" />
        <span className="text-sm font-medium text-muted-foreground">{currentIndex + 1}/{questions.length}</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">

        {/* Passage Check */}
        {currentQuestion.passage && (
          <Drawer>
            <DrawerTrigger asChild>
              <div className="bg-secondary/20 p-4 rounded-lg border-l-4 border-primary cursor-pointer hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-primary font-bold uppercase text-xs tracking-wide">
                  <BookOpen className="w-4 h-4" />
                  Read Passage
                </div>
                <p className="text-sm line-clamp-2 text-muted-foreground">
                  {currentQuestion.passage}
                </p>
                <div className="mt-2 text-center text-xs text-primary font-medium">Tap to read full text</div>
              </div>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
              <ScrollArea className="h-full p-6">
                <h3 className="font-bold mb-4 text-lg">Reading Passage</h3>
                <p className="leading-relaxed text-lg font-serif">
                  {currentQuestion.passage}
                </p>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        )}

        {/* Question */}
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold px-2 py-1 rounded bg-secondary text-secondary-foreground uppercase tracking-wide">
              {currentQuestion.topic} • {currentQuestion.subtopic}
            </span>
            {currentQuestion.difficulty > 3 && <Badge variant="destructive">Hard</Badge>}
          </div>

          <p className="text-xl font-medium leading-relaxed">{currentQuestion.content}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            let style = "border-border p-5 text-left text-lg hover:border-primary/50";
            if (isAnswered) {
              if (index === currentQuestion.correct_index) style = "border-success bg-success/10 text-success";
              else if (index === selectedAnswer) style = "border-destructive bg-destructive/10 text-destructive";
              else style = "border-border opacity-50";
            } else if (selectedAnswer === index) {
              style = "border-primary bg-primary/10 shadow-md";
            } else {
              // Strike-through logic could go here
            }

            return (
              <button
                key={index}
                disabled={isAnswered}
                onClick={() => setSelectedAnswer(index)}
                className={`w - full rounded - xl border - 2 transition - all ${style} `}
              >
                <span className="font-bold mr-3 opacity-50">{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <div className="bg-secondary/30 p-4 rounded-lg border border-border animate-in fade-in slide-in-from-bottom-2">
            <h4 className="font-bold mb-1">Explanation</h4>
            <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
          </div>
        )}
      </main>

      {/* Bottom Actions */}
      <div className="px-4 py-4 border-t border-border bg-background grid grid-cols-4 gap-2 fixed bottom-[80px] left-0 right-0 z-10 md:static md:bottom-auto">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-2"
          onClick={() => setHintUsed(true)}
          disabled={isAnswered || !currentQuestion.hint}
        >
          <Lightbulb className={`w - 5 h - 5 ${hintUsed ? 'text-yellow-400 fill-yellow-400' : ''} `} />
        </Button>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2">
              <Calculator className="w-5 h-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-4">Formula Sheet</h3>
              <div className="grid gap-4">
                {FORMULAS.map((f, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                    <span className="font-medium">{f.name}</span>
                    <code className="bg-background px-2 py-1 rounded">{f.formula}</code>
                  </div>
                ))}
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <Button
          variant={showScratchpad ? "secondary" : "outline"}
          size="icon"
          className="h-12 w-12 rounded-full border-2"
          onClick={() => setShowScratchpad(true)}
        >
          <Pencil className="w-5 h-5" />
        </Button>

        <div className="col-span-1"></div> {/* Spacer or Hint Text if needed */}

        <div className="absolute right-4 bottom-4 w-auto">
          {!isAnswered ? (
            <Button
              className="h-12 px-8 rounded-full shadow-lg font-bold text-lg"
              onClick={handleAnswer}
              disabled={selectedAnswer === null}
            >
              Check
            </Button>
          ) : (
            <Button
              className="h-12 px-8 rounded-full shadow-lg font-bold text-lg"
              onClick={nextQuestion}
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Hint Overlay */}
      {hintUsed && !isAnswered && currentQuestion.hint && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 p-3 rounded-lg mx-4 mb-2 animate-in fade-in">
          <p className="text-sm text-yellow-500 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 fill-yellow-500" />
            Hint: {currentQuestion.hint}
          </p>
        </div>
      )}

      {/* Scratchpad Overlay */}
      {showScratchpad && <Scratchpad onClose={() => setShowScratchpad(false)} />}
    </div>
  );
};

export default Practice;
