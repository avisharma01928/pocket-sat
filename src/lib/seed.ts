
import { db, Question } from "./db";

export const SEED_QUESTIONS: Question[] = [
    // Math - Algebra
    {
        id: "m-alg-1",
        topic: "Math",
        subtopic: "Algebra",
        difficulty: 1,
        content: "If 2x + 5 = 13, what is the value of x?",
        options: ["2", "3", "4", "5"],
        correct_index: 2,
        explanation: "Subtract 5 from both sides: 2x = 8. Divide by 2: x = 4.",
        hint: "Isolate x by performing inverse operations."
    },
    {
        id: "m-alg-2",
        topic: "Math",
        subtopic: "Algebra",
        difficulty: 3,
        content: "For what value of k does the system of equations \\n 3x + 4y = 12 \\n kx + 8y = 24 \\n have infinitely many solutions?",
        options: ["3", "4", "6", "9"],
        correct_index: 2,
        explanation: "For infinitely many solutions, the lines must be identical. 8y is 2 * 4y, so kx must be 2 * 3x. k = 6.",
        hint: "If lines are identical, their slopes and y-intercepts are equal."
    },
    {
        id: "m-alg-3",
        topic: "Math",
        subtopic: "Algebra",
        difficulty: 2,
        content: "Simplify: (3x^2 + 2x) - (x^2 - 4x)",
        options: ["2x^2 + 6x", "2x^2 - 2x", "4x^2 + 6x", "2x^2 - 6x"],
        correct_index: 0,
        explanation: "Distribute the negative sign: 3x^2 + 2x - x^2 + 4x = 2x^2 + 6x."
    },
    // Math - Geometry
    {
        id: "m-geo-1",
        topic: "Math",
        subtopic: "Geometry",
        difficulty: 2,
        content: "The radius of a circle is 5. What is its circumference?",
        options: ["5π", "10π", "25π", "10"],
        correct_index: 1,
        explanation: "Circumference = 2πr = 2 * π * 5 = 10π.",
        hint: "The formula for circumference is C = 2πr."
    },
    {
        id: "m-geo-2",
        topic: "Math",
        subtopic: "Geometry",
        difficulty: 3,
        content: "In a right triangle, one leg is 6 and the hypotenuse is 10. What is the length of the other leg?",
        options: ["4", "6", "8", "12"],
        correct_index: 2,
        explanation: "Pythagorean theorem: a^2 + 6^2 = 10^2 -> a^2 + 36 = 100 -> a^2 = 64 -> a = 8."
    },
    // English - Grammar
    {
        id: "e-gram-1",
        topic: "English",
        subtopic: "Grammar",
        difficulty: 2,
        content: "Neither of the players ___ ready for the game.",
        options: ["is", "are", "were", "have been"],
        correct_index: 0,
        explanation: "'Neither' is singular, so it takes the singular verb 'is'.",
        hint: "'Neither' is a singular subject."
    },
    {
        id: "e-gram-2",
        topic: "English",
        subtopic: "Grammar",
        difficulty: 4,
        content: "Identify the error: 'The team of scientists have discovered a new species.'",
        options: ["team", "have", "of", "No error"],
        correct_index: 1,
        explanation: "'Team' is a collective noun acting as a single unit here, so it requires the singular verb 'has', not 'have'.",
        hint: "Is 'team' singular or plural?"
    },
    {
        id: "e-gram-3",
        topic: "English",
        subtopic: "Grammar",
        difficulty: 2,
        content: "Select the correct word: 'The dog wagged ___ tail.'",
        options: ["it's", "its", "its'", "it"],
        correct_index: 1,
        explanation: "'Its' is the possessive form. 'It's' means 'it is'."
    },
    // English - Vocabulary
    {
        id: "e-voc-1",
        topic: "English",
        subtopic: "Vocabulary",
        difficulty: 3,
        content: "The scientist's theory was so ___ that no one could disprove it.",
        options: ["ambiguous", "robust", "feeble", "transient"],
        correct_index: 1,
        explanation: "Robust means strong and healthy; vigorous. In this context, it means well-supported.",
        hint: "Think about a word that means strong or solid."
    },
    {
        id: "e-voc-2",
        topic: "English",
        subtopic: "Vocabulary",
        difficulty: 4,
        content: "His speech was brief but ___.",
        options: ["verbose", "pithy", "circuitous", "redundant"],
        correct_index: 1,
        explanation: "Pithy means concise and forcefully expressive.",
        hint: "Look for a word that implies 'full of meaning'."
    }
];

export const seedQuestions = async () => {
    const count = await db.questions.count();
    if (count === 0) {
        await db.questions.bulkAdd(SEED_QUESTIONS);
        console.log("Seeded question bank with " + SEED_QUESTIONS.length + " questions.");
    }
};
