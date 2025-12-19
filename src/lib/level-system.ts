// Level calculation utilities
export const LEVEL_NAMES = [
  { range: [1, 5], name: "Beginner" },
  { range: [6, 10], name: "Novice" },
  { range: [11, 20], name: "Intermediate" },
  { range: [21, 30], name: "Advanced" },
  { range: [31, 40], name: "Expert" },
  { range: [41, 50], name: "Master" },
  { range: [51, 75], name: "Grandmaster" },
  { range: [76, 100], name: "Legend" },
  { range: [101, Infinity], name: "Mythic" },
];

export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  let xpNeeded = 0;

  while (xpNeeded <= totalXP) {
    level++;
    xpNeeded += getXPForLevel(level);
  }

  return level - 1;
}

export function getXPForLevel(level: number): number {
  // Base XP needed for level 1 is 100
  // Every 10 levels, add +50 to the requirement
  const tier = Math.floor((level - 1) / 10);
  return 100 + tier * 50;
}

export function getXPForNextLevel(currentLevel: number): number {
  return getXPForLevel(currentLevel + 1);
}

export function getTotalXPForLevel(targetLevel: number): number {
  let total = 0;
  for (let i = 1; i <= targetLevel; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

export function getProgressToNextLevel(totalXP: number): {
  currentLevel: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  const currentLevel = getLevelFromXP(totalXP);
  const totalXPForCurrentLevel = getTotalXPForLevel(currentLevel);
  const currentLevelXP = totalXP - totalXPForCurrentLevel;
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const progress = (currentLevelXP / nextLevelXP) * 100;

  return {
    currentLevel,
    currentLevelXP,
    nextLevelXP,
    progress,
  };
}

export function getLevelName(level: number): string {
  for (const { range, name } of LEVEL_NAMES) {
    if (level >= range[0] && level <= range[1]) {
      return name;
    }
  }
  return "Unknown";
}

export function calculateXPForQuestion(difficulty: number): number {
  // Easy (1): 5 XP, Medium (2-3): 7 XP, Hard (4-5): 10 XP
  if (difficulty === 1) return 5;
  if (difficulty === 2 || difficulty === 3) return 7;
  return 10; // difficulty 4-5
}
