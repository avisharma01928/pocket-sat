
import { db } from "./db";

// Simple SM-2 inspired algorithm
export const updateSRS = async (questionId: string, isCorrect: boolean) => {
    const question = await db.questions.get(questionId);
    if (!question) return;

    let interval = question.srs_interval || 0;

    if (isCorrect) {
        if (interval === 0) interval = 1;
        else if (interval === 1) interval = 3;
        else interval = Math.round(interval * 2.5);
    } else {
        interval = 0; // Reset
    }

    const nextReview = Date.now() + (interval * 24 * 60 * 60 * 1000);

    await db.questions.update(questionId, {
        srs_interval: interval,
        next_review: nextReview
    });
};

export const getReviewQuestions = async (limit = 10) => {
    const now = Date.now();
    return await db.questions
        .filter(q => (q.next_review !== undefined && q.next_review <= now) || q.srs_interval === 0)
        .limit(limit)
        .toArray();
};

export const updateDifficulty = async (questionId: string, isCorrect: boolean) => {
    const question = await db.questions.get(questionId);
    if (!question) return;

    let diff = question.difficulty;
    if (isCorrect) {
        // If correct, decrease difficulty slightly (easier than thought)
        diff = Math.max(1, diff - 0.05);
    } else {
        // If wrong, increase difficulty (harder than thought)
        diff = Math.min(5, diff + 0.05);
    }

    await db.questions.update(questionId, { difficulty: diff });
};
