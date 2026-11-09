import { Timestamp } from "firebase/firestore";

// Fixed branch codes — PRD.md §F1 (identical list on Drives.eligibility)
export type Branch = "CSE" | "IT" | "ECE" | "EEE" | "MECH" | "CIVIL" | "OTHER";
export const BRANCHES: Branch[] = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "OTHER"];

export type TargetRole = "Data Analyst" | "SDE" | "QA" | "Data Engineer" | "Other";
export const TARGET_ROLES: TargetRole[] = ["Data Analyst", "SDE", "QA", "Data Engineer", "Other"];

export type DriveStatus = "CONFIRMED" | "TENTATIVE";

export interface DriveEligibility {
  tenthMin?: number;
  twelfthMin?: number;
  cgpaMin?: number;
  maxBacklogs?: number;
  branches?: Branch[];
}

export interface Drive {
  id: string;
  companyName: string;
  companySlug: string;
  initials: string;
  color: string;
  program: string;
  role: string;
  batch: string;
  type: "ON" | "OFF";
  regDeadline: Timestamp | null;
  testDate: Timestamp | null;
  salary: string;
  openings: string;
  eligibility: DriveEligibility;
  roundsInfo: string;
  sourceUrl: string;
  sourceName: string;
  status: DriveStatus;
  verifiedAt: Timestamp;
}

/**
 * Public portfolio fields — stored in /portfolios/{uid} (public read).
 * These are the ONLY fields anonymous visitors may see; email, marks, CGPA
 * and backlogs live in the owner-only /users/{uid} document (firestore.rules).
 */
export interface PublicProfile {
  name: string;
  college: string;
  branch: Branch;
  year: number;
  targetRole: string;
  portfolioSlug: string;
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt?: Timestamp;
}

/** Owner-only account + eligibility document — /users/{uid}. Never public. */
export interface Student extends PublicProfile {
  email: string;
  tenth: number;
  twelfth: number;
  cgpa: number;
  backlogs: number;
}

export type AppStatus = "SAVED" | "APPLIED" | "OA" | "INTERVIEW" | "OFFER" | "REJECTED";

export const STAGES: { key: AppStatus; label: string }[] = [
  { key: "SAVED", label: "Saved" },
  { key: "APPLIED", label: "Applied" },
  { key: "OA", label: "Test/OA" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "REJECTED", label: "Rejected" },
];

export interface HistoryEntry {
  status: AppStatus;
  at: Timestamp;
}

export interface Application {
  id: string;
  uid: string;
  driveId: string;
  status: AppStatus;
  history: HistoryEntry[];
  updatedAt: Timestamp;
}

export type ActivityType = "PROJECT" | "CERT" | "COURSE" | "DSA" | "ACHIEVEMENT";

export const ACTIVITY_TYPES: { key: ActivityType; label: string }[] = [
  { key: "PROJECT", label: "Project" },
  { key: "CERT", label: "Certificate" },
  { key: "COURSE", label: "Course" },
  { key: "DSA", label: "DSA" },
  { key: "ACHIEVEMENT", label: "Achievement" },
];

export interface Activity {
  id: string;
  uid: string;
  type: ActivityType;
  title: string;
  summary: string;
  url: string;
  tags: string[];
  date: Timestamp;
  createdAt?: Timestamp;
  /** optional compressed image data URI (PRD §7.2) — null field means "removed" */
  image?: string | null;
}

// One row of the eligibility table: pass === undefined → criterion not published on the drive
export interface Check {
  label: string;
  need: string;
  have: string;
  pass: boolean | undefined;
  /** rendered row "All branches eligible" instead of need/have */
  allBranches?: boolean;
}

/** Formatter fragment used by EligibilityBadge: failing drive/branch criterion. */
export interface EligibilityResult {
  match: boolean;
  checks: Check[];
  missingProfile: boolean;
  failedNote?: string;
  criteriaPending: boolean;
}
