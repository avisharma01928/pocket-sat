
import { db } from './db';
import { supabase } from './supabase';
import { toast } from 'sonner';

export const syncData = async (userId: string, silent = false) => {
    try {
        if (!silent) toast.info("Syncing data...");

        // 1. Push Local Profile to Supabase
        const localProfile = await db.profile.get(1);
        if (localProfile) {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    target_date: localProfile.target_date,
                    goal_score: localProfile.goal_score,
                    current_streak: localProfile.current_streak,
                    questions_mastered: localProfile.questions_mastered,
                    total_questions_answered: localProfile.total_questions_answered,
                    accuracy: localProfile.accuracy,
                    level: localProfile.level,
                    total_xp: (localProfile as any).total_xp || 0
                });
            if (error) console.error("Profile Push Error:", error);
        }

        // 2. Push Local Attempts
        // Only push attempts that haven't been synced? For now, we'll simple push all (upsert)
        // Optimization: Add 'synced' flag to local attempts.
        const allAttempts = await db.attempts.toArray();
        if (allAttempts.length > 0) {
            const attemptsPayload = allAttempts.map(a => ({
                user_id: userId,
                question_id: a.question_id,
                is_correct: a.is_correct,
                selected_answer: a.selected_answer,
                timestamp: new Date(a.timestamp).toISOString(),
                time_taken_seconds: a.time_taken_seconds
            }));

            const { error } = await supabase
                .from('attempts')
                .upsert(attemptsPayload, { onConflict: 'user_id, question_id, timestamp' }); // Assuming composite key
            if (error) console.error("Attempts Push Error:", error);
        }

        if (!silent) toast.success("Sync complete!");
    } catch (e) {
        console.error("Sync failed:", e);
        toast.error("Sync failed. Check console.");
    }
};
