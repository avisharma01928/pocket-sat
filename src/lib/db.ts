
import Dexie, { Table } from 'dexie';

export interface Question {
    id: string;
    topic: string; // e.g., "Algebra", "Grammar"
    subtopic: string; // e.g., "Linear Equations"
    difficulty: number; // 1-5
    content: string; // Markdown or HTML
    options: string[]; // [A, B, C, D]
    correct_index: number;
    explanation: string;
    hint?: string;
    passage?: string; // For reading comprehension
    srs_interval?: number; // Days until next review
    next_review?: number; // Timestamp
}

export interface Attempt {
    id?: number; // Auto-increment
    question_id: string;
    is_correct: boolean;
    selected_answer: number;
    timestamp: number;
    time_taken_seconds: number;
}

export interface UserProfile {
    id?: number; // Singleton (always 1)
    target_date: string;
    goal_score: number;
    current_streak: number;
    questions_mastered: number;
    total_questions_answered: number;
    accuracy: number; // 0.0 to 1.0
    level: number; // 1-5 (User's calibration)
}

class PocketSatDB extends Dexie {
    questions!: Table<Question>;
    attempts!: Table<Attempt>;
    profile!: Table<UserProfile>;

    constructor() {
        super('PocketSatDB');
        this.version(1).stores({
            questions: 'id, topic, subtopic, difficulty, next_review',
            attempts: '++id, question_id, is_correct, timestamp',
            profile: '++id' // We'll strictly use ID 1
        });
    }
}

export const db = new PocketSatDB();
