import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, Question } from "@/lib/db";
import { seedQuestions } from "@/lib/seed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateXPForQuestion } from "@/lib/level-system";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

const Placement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    const init = async () => {
      await seedQuestions();
      loadPlacementQuestions();
    };
    init();
  }, []);

  const loadPlacementQuestions = async () => {
    // Get all questions and shuffle, picking 10
    const allQuestions = await db.questions.toArray();
    const shuffled = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(shuffled);
    setLoading(false);
  };

  const handleAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_index;

    if (isCorrect) {
      setScore(score + calculateXPForQuestion(currentQuestion.difficulty));
      setCorrectAnswers(correctAnswers + 1);
    }

    // Save attempt (fire and forget)
    db.attempts.add({
      question_id: currentQuestion.id,
      is_correct: isCorrect,
      selected_answer: selectedAnswer,
      timestamp: Date.now(),
      time_taken_seconds: 0 // Placeholder
    });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishPlacement();
    }
  };

  const finishPlacement = async () => {
    // Calculate placed level (1-5 based on 10 Qs)
    let placedLevel = 1;
    if (correctAnswers >= 9) placedLevel = 5;
    else if (correctAnswers >= 7) placedLevel = 4;
    else if (correctAnswers >= 5) placedLevel = 3;
    else if (correctAnswers >= 3) placedLevel = 2;

    await db.profile.update(1, {
      level: placedLevel,
      questions_mastered: correctAnswers, // simplistic
      total_questions_answered: questions.length,
      accuracy: correctAnswers / questions.length,
    });

    toast.success(`Placement complete! Starting at Level ${placedLevel}`);
    navigate("/dashboard");
  };

  if (loading || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex justify-between items-center text-xl text-foreground">
              <span>Diagnostic Test</span>
              <span className="text-sm font-normal text-muted-foreground">
                {currentIndex + 1}/{questions.length}
              </span>
            </CardTitle>
            <Progress value={progress} className="h-2 mt-4 bg-secondary" indicatorClassName="bg-primary" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-bold px-2 py-1 rounded bg-secondary text-secondary-foreground uppercase tracking-wide">
                {currentQuestion.topic} • {currentQuestion.subtopic}
              </span>
              <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground">
                {currentQuestion.content}
              </p>
            </div>

            <div className="grid gap-3">
              {currentQuestion.options.map((option: string, index: number) => {
                let optionStyle = "border-border hover:border-primary/50 hover:bg-secondary/50";
                if (isAnswered) {
                  if (index === currentQuestion.correct_index) optionStyle = "border-success bg-success/10 text-success";
                  else if (index === selectedAnswer) optionStyle = "border-destructive bg-destructive/10 text-destructive";
                } else if (selectedAnswer === index) {
                  optionStyle = "border-primary bg-primary/10 shadow-md";
                }

                return (
                  <button
                    key={index}
                    disabled={isAnswered}
                    onClick={() => setSelectedAnswer(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all flex items-center justify-between ${optionStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && index === currentQuestion.correct_index && <CheckCircle className="w-5 h-5" />}
                    {isAnswered && index === selectedAnswer && index !== currentQuestion.correct_index && <XCircle className="w-5 h-5" />}
                  </button>
                )
              })}
            </div>

            <div className="pt-4">
              {!isAnswered ? (
                <Button
                  onClick={handleAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full text-lg h-12"
                  size="lg"
                >
                  Check Answer
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  className="w-full text-lg h-12"
                  size="lg"
                >
                  {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Placement;
