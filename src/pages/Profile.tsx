import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, UserProfile } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Settings, Trophy, Flame, BarChart3, Trash2, Power } from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { supabase } from "@/lib/supabase";
import { syncData } from "@/lib/sync";
import { Input } from "@/components/ui/input";
import { Cloud } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [offlineMode, setOfflineMode] = useState(true); // Default true for now
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await db.profile.get(1);
        if (!user) {
          navigate("/");
          return;
        }
        setProfile(user);

        // Calculate Graph Data (Last 7 Days)
        const attempts = await db.attempts.toArray();
        const data = [];
        for (let i = 6; i >= 0; i--) {
          const date = subDays(new Date(), i);

          // Filter attempts for this day
          const dayAttempts = attempts.filter(a =>
            new Date(a.timestamp).toDateString() === date.toDateString()
          );

          const accuracy = dayAttempts.length > 0
            ? Math.round((dayAttempts.filter(a => a.is_correct).length / dayAttempts.length) * 100)
            : 0;

          data.push({ name: format(date, 'EEE'), accuracy });
        }
        setGraphData(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const [userSession, setUserSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    else toast.success("Logged in!");
    setAuthLoading(false);
  };

  const handleSignup = async () => {
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) toast.error(error.message);
    else toast.success("Check your email to confirm markup!");
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSync = async () => {
    if (!userSession) return;
    await syncData(userSession.user.id);
  };

  const handleReset = async () => {
    if (confirm("Are you sure? This will delete all your progress and history.")) {
      await db.delete();
      await db.open(); // Re-open to allow re-seeding if needed, or just reload
      window.location.href = "/";
    }
  };

  if (loading || !profile) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const badges = [
    { icon: <User className="w-6 h-6" />, name: "Newcomer", unlocked: true },
    { icon: <Flame className="w-6 h-6" />, name: "3 Day Streak", unlocked: profile.current_streak >= 3 },
    { icon: <Trophy className="w-6 h-6" />, name: "Level 5", unlocked: profile.level >= 5 },
    { icon: <BarChart3 className="w-6 h-6" />, name: "Precision", unlocked: profile.accuracy > 80 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 p-6 space-y-8">
      <header className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary border-2 border-primary">
          {profile.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-muted-foreground">Level {profile.level} • {profile.total_xp} XP</p>
        </div>
      </header>

      {/* Stats Graph */}
      <Card className="border-none bg-gradient-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Accuracy Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData}>
              <defs>
                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: 'none' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorAcc)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Badges */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Achievements
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {badges.map((badge, i) => (
            <div key={i} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${badge.unlocked ? 'bg-secondary/30 border-primary text-primary' : 'bg-muted/20 border-border text-muted-foreground opacity-50'}`}>
              {badge.icon}
              <span className="text-[10px] uppercase font-bold text-center leading-tight px-1">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Settings */}
      <div className="space-y-6">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Settings className="w-5 h-5" /> Settings
        </h3>

        {/* Sync Section */}
        <Card className="bg-secondary/20 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Cloud className="w-4 h-4" /> Cloud Sync
            </CardTitle>
            <CardDescription>Save your progress to the cloud.</CardDescription>
          </CardHeader>
          <CardContent>
            {!userSession ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleLogin} disabled={authLoading}>
                    {authLoading ? "Loading..." : "Login"}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleSignup} disabled={authLoading}>
                    Sign Up
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Logged in as {userSession.user.email}</p>
                <Button className="w-full" onClick={handleSync}>
                  Sync Now
                </Button>
                <Button variant="ghost" className="w-full text-red-400" onClick={handleLogout}>
                  Log Out
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Offline Mode</Label>
            <p className="text-xs text-muted-foreground">Keep data only on this device.</p>
          </div>
          <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
        </div>

        <Button variant="destructive" className="w-full" onClick={handleReset}>
          <Trash2 className="mr-2 w-4 h-4" /> Reset All Progress
        </Button>
      </div>
    </div>
  );
};

export default Profile;
