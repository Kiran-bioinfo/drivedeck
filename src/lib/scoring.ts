import type { Activity } from "./types";

// PRD.md §13 — the formula is public; there is no `score` field in the database.
export const WEIGHTS = {
  PROJECT: 15,
  CERT: 10,
  COURSE: 5,
  DSA: 2,
  ACHIEVEMENT: 0,
} as const;

// PRD §13 edge case (decision at build time): cap DSA influence at 20 sets.
export const DSA_CAP = 20;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Calendar-day −1 (audit 2.7): subtracting 24h of real time from local midnight
// lands at 23:00 two days back across a DST spring-forward, which silently
// breaks the streak walk. Date Y/M/D−1 normalizes on the calendar instead.
function prevDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
}

// Consecutive calendar days (ending today or yesterday) with ≥ 1 activity.
export function streakDays(activities: Activity[], now: Date = new Date()): number {
  const days = new Set(activities.map((a) => startOfDay(a.date.toDate()).getTime()));
  let cursor = startOfDay(now);
  if (!days.has(cursor.getTime())) {
    cursor = prevDay(cursor);
    if (!days.has(cursor.getTime())) return 0;
  }
  let streak = 0;
  while (days.has(cursor.getTime())) {
    streak += 1;
    cursor = prevDay(cursor);
  }
  return streak;
}

export interface ScoreParts {
  projects: number; projectPoints: number;
  certs: number; certPoints: number;
  courses: number; coursePoints: number;
  dsa: number; dsaPoints: number; dsaCapped: boolean;
  streak: number; streakBonus: number;
  total: number;
}

export function scoreParts(activities: Activity[], streak: number): ScoreParts {
  const count = (t: Activity["type"]) => activities.filter((a) => a.type === t).length;
  const projects = count("PROJECT");
  const certs = count("CERT");
  const courses = count("COURSE");
  const dsa = Math.min(count("DSA"), DSA_CAP);
  const streakBonus = Math.min(10, 0.5 * streak);
  const total = Math.min(
    100,
    Math.round(
      projects * WEIGHTS.PROJECT + certs * WEIGHTS.CERT + courses * WEIGHTS.COURSE + dsa * WEIGHTS.DSA + streakBonus
    )
  );
  return {
    projects, projectPoints: projects * WEIGHTS.PROJECT,
    certs, certPoints: certs * WEIGHTS.CERT,
    courses, coursePoints: courses * WEIGHTS.COURSE,
    dsa, dsaPoints: dsa * WEIGHTS.DSA, dsaCapped: count("DSA") > DSA_CAP,
    streak, streakBonus,
    total,
  };
}

export function computeScore(activities: Activity[], streak: number): number {
  return scoreParts(activities, streak).total;
}
