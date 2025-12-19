
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, Question, Attempt } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Bookmark, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MistakeItem {
    attempt: Attempt;
    question: Question;
}

const Review = () => {
    const navigate = useNavigate();
    const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMistakes = async () => {
            const allAttempts = await db.attempts.toArray();
            // Filter for incorrect attempts
            const incorrect = allAttempts.filter(a => !a.is_correct);

            // Get unique question IDs for efficient fetching
            const questionIds = Array.from(new Set(incorrect.map(a => a.question_id)));
            const questions = await db.questions.bulkGet(questionIds);

            // Map back to maintain attempt context (most recent attempt per question ideally, or all)
            // Let's just show unique questions that have been missed
            const uniqueMistakes: MistakeItem[] = [];
            questionIds.forEach(qId => {
                const q = questions.find(q => q && q.id === qId);
                const att = incorrect.find(a => a.question_id === qId); // Just get one attempt
                if (q && att) {
                    uniqueMistakes.push({ attempt: att, question: q });
                }
            });

            setMistakes(uniqueMistakes);
            setLoading(false);
        };
        loadMistakes();
    }, []);

    const handleFixMistakes = () => {
        const ids = mistakes.slice(0, 10).map(m => m.question.id);
        navigate("/practice", { state: { questionIds: ids } });
    };

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-background text-foreground pb-24 p-6">
            <header className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold">Review</h1>
                <p className="text-muted-foreground text-sm">Analyze your performance and fix knowledge gaps.</p>
            </header>

            <Tabs defaultValue="mistakes" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="mistakes">My Mistakes ({mistakes.length})</TabsTrigger>
                    <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
                </TabsList>

                <TabsContent value="mistakes" className="space-y-6">
                    {mistakes.length > 0 ? (
                        <>
                            {/* Action Card */}
                            <div className="bg-gradient-to-r from-red-900/40 to-background border border-red-900/50 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg flex items-center gap-2 text-red-400">
                                        <AlertCircle className="w-5 h-5" />
                                        Fix Your Mistakes
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Generate a custom quiz with up to 10 questions you previously got wrong.</p>
                                </div>
                                <Button size="lg" onClick={handleFixMistakes} className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white border-none">
                                    <Play className="mr-2 w-4 h-4" /> Start Repair Session
                                </Button>
                            </div>

                            <ScrollArea className="h-[60vh] pr-4">
                                <div className="space-y-4">
                                    {mistakes.map((item, i) => (
                                        <Card key={i} className="bg-gradient-card border-none hover:bg-secondary/20 transition-colors cursor-pointer group">
                                            <CardContent className="p-4 flex items-start justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <Badge variant="outline" className="text-xs">{item.question.topic}</Badge>
                                                        <Badge variant="secondary" className="text-xs bg-red-900/20 text-red-400">Missed {new Date(item.attempt.timestamp).toLocaleDateString()}</Badge>
                                                    </div>
                                                    <p className="font-medium line-clamp-2">{item.question.content}</p>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </>
                    ) : (
                        <div className="text-center py-20 space-y-4">
                            <div className="bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold">No Mistakes Yet!</h3>
                            <p className="text-muted-foreground">Great job. Go practice more to find your weak spots.</p>
                            <Button variant="outline" onClick={() => navigate("/practice")}>Go to Practice</Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="bookmarks">
                    <div className="text-center py-20 space-y-4 text-muted-foreground">
                        <Bookmark className="w-12 h-12 mx-auto opacity-20" />
                        <p>No bookmarks saved yet.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Review;

