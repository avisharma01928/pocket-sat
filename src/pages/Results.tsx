import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Zap, Home } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { earnedXP, correctCount, totalQuestions, accuracy } = location.state || {};

  useEffect(() => {
    // Celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  if (!location.state) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <div className="container mx-auto max-w-2xl py-8 space-y-6">
        <Card className="bg-gradient-card border-none shadow-lg text-center">
          <CardHeader>
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-success flex items-center justify-center mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl">Session Complete!</CardTitle>
            <p className="text-muted-foreground">Great job practicing!</p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">XP Earned</p>
              <p className="text-3xl font-bold text-primary">+{earnedXP}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-3">
                <Target className="h-6 w-6 text-success" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Correct</p>
              <p className="text-3xl font-bold text-success">
                {correctCount}/{totalQuestions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-accent">{Math.round(accuracy)}%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Keep it up!</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Continue practicing daily to maintain your streak
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                Focus on harder questions to earn more XP
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Unlock achievements by reaching milestones
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button size="lg" onClick={() => navigate("/practice")}>
            Practice Again
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")}>
            <Home className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
