
export interface ModuleNode {
    id: string;
    title: string;
    subject: "math" | "english";
    description: string;
    status: "locked" | "incomplete" | "mastered" | "review";
    position: "left" | "right"; // Visual alignment
    videoUrl?: string; // YouTube embed ID
    concepts: string[]; // Card content
}

export const CURRICULUM_NODES: ModuleNode[] = [
    {
        id: "m1",
        title: "Linear Equations",
        subject: "math",
        description: "Solving for x in one variable.",
        status: "mastered", // Mock status
        position: "left",
        videoUrl: "xiZ8784w5hA", // Khan Academy Algebra basics (example ID)
        concepts: [
            "Isolate the variable by performing inverse operations.",
            "What you do to one side, you must do to the other.",
            "Check your solution by plugging it back in."
        ]
    },
    {
        id: "e1",
        title: "Subject-Verb Agreement",
        subject: "english",
        description: "Matching singular subjects with singular verbs.",
        status: "review",
        position: "right",
        videoUrl: "M0K0b14tCqg", // Example
        concepts: [
            "Singular subjects take singular verbs (s ending).",
            "Plural subjects take base verbs.",
            "Ignore prepositional phrases between subject and verb."
        ]
    },
    {
        id: "m2",
        title: "Systems of Equations",
        subject: "math",
        description: "Solving multiple linear equations.",
        status: "incomplete",
        position: "left",
        concepts: [
            "Substitution Method: Solve one eq for var, plug into other.",
            "Elimination Method: Add/Subtract eqs to cancel a var."
        ]
    },
    {
        id: "e2",
        title: "Punctuation: Commas",
        subject: "english",
        description: "Using commas in lists and compound sentences.",
        status: "locked",
        position: "right",
        concepts: [
            "Use before FANBOYS in compound sentences.",
            "Use for items in a list of 3+.",
            "Use for introductory clauses."
        ]
    },
    {
        id: "m3",
        title: "Quadratics",
        subject: "math",
        description: "Factoring and the Quadratic Formula.",
        status: "locked",
        position: "left",
        concepts: ["ax^2 + bx + c = 0", "Quadratic formula: x = (-b ± √(b^2-4ac))/2a"]
    },
    {
        id: "e3",
        title: "Vocabulary in Context",
        subject: "english",
        description: "Inferring meaning from text.",
        status: "locked",
        position: "right",
        concepts: ["Read the surrounding sentences.", "Replace the word with your own prediction."]
    }
];
