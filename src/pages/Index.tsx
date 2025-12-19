import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowRight, Target, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [score, setScore] = useState([1200]);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const profile = await db.profile.get(1);
        if (profile) {
          if (profile.level > 0) {
            navigate("/dashboard");
          } else {
            // Profile exists but diagnostic not taken? Maybe go to placement
            navigate("/placement");
          }
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setIsChecking(false);
      }
    };
    checkProfile();
  }, [navigate]);

  const handleStart = async () => {
    if (!date) {
      toast.error("Please select a target test date");
      return;
    }

    try {
      await db.profile.put({
        id: 1,
        target_date: date.toISOString(),
        goal_score: score[0],
        current_streak: 0,
        questions_mastered: 0,
        total_questions_answered: 0,
        accuracy: 0,
        level: 0, // 0 = Diagnostic not taken
      });
      navigate("/placement");
    } catch (error) {
      console.error("Failed to create profile:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (isChecking) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-primary">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-primary/80 bg-clip-text text-transparent">
            Pocket SAT
          </h1>
          <p className="text-muted-foreground text-lg">
            Your open-source, distraction-free tutor.
          </p>
        </div>

        <div className="space-y-8 bg-card/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Target className="w-5 h-5" />
              <Label>When is your test?</Label>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 text-lg",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-primary font-medium">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <Label>Goal Score</Label>
              </div>
              <span className="text-xl font-bold">{score[0]}</span>
            </div>
            <Slider
              defaultValue={[1200]}
              max={1600}
              min={800}
              step={10}
              value={score}
              onValueChange={setScore}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>800</span>
              <span>1600</span>
            </div>
          </div>

          <Button
            className="w-full h-14 text-lg font-bold shadow-glow mt-8 hover:scale-[1.02] transition-transform"
            onClick={handleStart}
          >
            Start Diagnostic
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
