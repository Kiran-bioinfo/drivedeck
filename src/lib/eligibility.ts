import type { Check, Drive, EligibilityResult, Student } from "./types";

const num = (v: number | undefined) => (v == null ? undefined : v);
const fmt = (v: number | string) => String(v);

// Pure function — PRD §F3 / Design.md Sheet 3.14. No Firestore access.
export function checkEligibility(profile: Student | null, drive: Drive): EligibilityResult {
  const e = drive.eligibility;
  const checks: Check[] = [];
  let failedNote: string | undefined;

  const add = (label: string, needRaw: number | undefined, haveRaw: number | undefined, pass: boolean | undefined, note: string, allBranches?: boolean) => {
    checks.push({ label, need: needRaw == null ? "" : fmt(needRaw), have: haveRaw == null ? "" : fmt(haveRaw), pass, ...(allBranches ? { allBranches: true } : {}) });
    if (pass === false && !failedNote) failedNote = note;
  };

  const t10 = num(e.tenthMin);
  if (t10 != null) add("10th", t10, profile?.tenth, profile?.tenth == null ? undefined : profile.tenth >= t10, `10th below ${fmt(t10)}`);

  const t12 = num(e.twelfthMin);
  if (t12 != null) add("12th", t12, profile?.twelfth, profile?.twelfth == null ? undefined : profile.twelfth >= t12, `12th below ${fmt(t12)}`);

  const cg = num(e.cgpaMin);
  if (cg != null) add("CGPA", cg, profile?.cgpa, profile?.cgpa == null ? undefined : profile.cgpa >= cg, `CGPA below ${fmt(cg)}`);

  const bl = num(e.maxBacklogs);
  if (bl != null) add("Backlogs", bl, profile?.backlogs, profile?.backlogs == null ? undefined : profile.backlogs <= bl, `Backlogs above ${fmt(bl)}`);

  // Branch: absent list → all branches eligible
  if (e.branches && e.branches.length > 0) {
    const inList = profile?.branch != null && e.branches.includes(profile.branch);
    add("Branch", undefined, undefined, profile?.branch == null ? undefined : inList, `Open to: ${e.branches.join(", ")}`);
  } else {
    add("Branch", undefined, undefined, true, "", true);
  }

  const anyCriterion = e.tenthMin != null || e.twelfthMin != null || e.cgpaMin != null || e.maxBacklogs != null;
  const missingProfile = profile == null || profile.cgpa == null;
  const allPass = checks.every((c) => c.pass !== false);
  const match = !missingProfile && anyCriterion && allPass;

  return { match, checks, missingProfile, failedNote, criteriaPending: !anyCriterion };
}
