import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, UserProfile } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { differenceInDays } from "date-fns";
import { Flame, Target, Trophy, Play, Users } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const user = await db.profile.get(1);
      const count = await db.questions.count();
      setTotalQuestions(count);

      if (!user) {
        navigate("/");
        return;
      }
      setProfile(user);
      setLoading(false);
    };
    loadData();
  }, [navigate]);

  if (loading || !profile) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;
  }

  const daysLeft = differenceInDays(new Date(profile.target_date), new Date());
  const masteryPercentage = totalQuestions > 0 ? Math.round((profile.questions_mastered / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-8 animate-fade-in pb-24">
      {/* Top Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="text-5xl font-extrabold text-primary">{daysLeft}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Days Until Exam</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
            <Users className="w-3 h-3 text-primary animate-pulse" />
            <span>340 students studying now</span>
          </div>
        </div>
      </header>

      {/* Main Action Area - Daily Mix */}
      <div className="flex justify-center py-6">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Pulsing Glow */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />

          {/* Circular Progress Ring (SVG) */}
          <svg className="w-full h-full -rotate-90">
            <circle cx="128" cy="128" r="110" stroke="hsl(var(--secondary))" strokeWidth="12" fill="none" />
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="hsl(var(--primary))"
              strokeWidth="12"
              fill="none"
              strokeDasharray="691"
              strokeDashoffset={691 - (691 * 0.3)} /* Mock 30% daily progress */
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>

          {/* Start Button */}
          <Button
            onClick={() => navigate("/practice")}
            className="absolute w-40 h-40 rounded-full bg-background border-4 border-secondary hover:border-primary shadow-2xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 group z-10"
          >
            <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Play className="w-8 h-8 text-primary fill-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">Start Session</span>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-card border-none shadow-md">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <Flame className="w-8 h-8 text-warning mb-1" />
            <div className="text-2xl font-bold">{profile.current_streak}</div>
            <div className="text-xs text-muted-foreground uppercase">Day Streak</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-none shadow-md">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <Trophy className="w-8 h-8 text-yellow-400 mb-1" />
            <div className="text-2xl font-bold">{masteryPercentage}%</div>
            <div className="text-xs text-muted-foreground uppercase">Mastery</div>
          </CardContent>
        </Card>
      </div>

      {/* Motivation or Info */}
      <div className="text-center text-muted-foreground text-sm">
        "Success is sum of small efforts, repeated day in and day out."
      </div>
    </div>
  );
};

export default Dashboard;
