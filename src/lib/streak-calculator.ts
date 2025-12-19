// Streak calculation utilities
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isNextDay(lastDate: Date, currentDate: Date): boolean {
  const nextDay = new Date(lastDate);
  nextDay.setDate(nextDay.getDate() + 1);
  return isSameDay(nextDay, currentDate);
}

export function calculateStreak(
  lastActivityDate: string | null,
  currentStreak: number
): { newStreak: number; shouldReset: boolean } {
  if (!lastActivityDate) {
    return { newStreak: 1, shouldReset: false };
  }

  const lastDate = new Date(lastActivityDate);
  const today = new Date();

  if (isSameDay(lastDate, today)) {
    // Same day, don't change streak
    return { newStreak: currentStreak, shouldReset: false };
  }

  if (isNextDay(lastDate, today)) {
    // Next day, increment streak
    return { newStreak: currentStreak + 1, shouldReset: false };
  }

  // Gap detected, reset streak
  return { newStreak: 1, shouldReset: true };
}

export function getStreakBonus(streak: number): number {
  if (streak >= 30) return 20;
  if (streak >= 14) return 10;
  if (streak >= 7) return 5;
  return 0;
}
