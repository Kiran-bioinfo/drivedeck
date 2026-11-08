// scripts/seed.mjs — DriveDeck seed script (PRD.md §12.4).
//
// Runs in Node with firebase-admin + a service-account key at scripts/service-account.json
// (dev-only: gitignored, never deployed, never imported from app code). Admin writes
// bypass security rules — that is exactly why rules set drives/companies: write: false.
//
// Usage:
//   node scripts/seed.mjs              → upsert companies + drives only
//   node scripts/seed.mjs --uid=XXXX   → also seed the demo account (Kiran) with this uid
//                                        (the Google uid you sign in with on localhost)
//
// HUMAN VERIFICATION WORKFLOW (PRD §12.1): every drive row below is a placeholder until
// YOU read the official page named in `verifyAt` and fill the real values. Default status
// stays TENTATIVE; promote to CONFIRMED only when the source page states the date.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, serverTimestamp, Timestamp } from "firebase-admin/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keyPath = path.join(__dirname, "service-account.json");

if (!fs.existsSync(keyPath)) {
  console.error(
    "\n[DriveDeck] Missing scripts/service-account.json\n" +
      "Firebase Console → Project settings → Service accounts → Generate new private key,\n" +
      "then copy the downloaded file to scripts/service-account.json (it is gitignored).\n"
  );
  process.exit(1);
}

initializeApp({ credential: cert(keyPath) });
const db = getFirestore();

const DEMO_UID = process.argv.find((a) => a.startsWith("--uid="))?.slice(6) ?? null;

// ---------------------------------------------------------------------------
// Deterministic IDs — MUST stay byte-identical to src/lib/ids.ts (PRD §9.3).
// ---------------------------------------------------------------------------
const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const driveId = (company, program, batch) => `${slugify(company)}_${slugify(program)}_${slugify(batch)}`;
const applicationId = (uid, drive) => `${uid}_${drive}`;

// ---------------------------------------------------------------------------
// 1. COMPANIES (PRD §12.2) — upsert, idempotent.
// ---------------------------------------------------------------------------
const COMPANIES = [
  { slug: "tcs", name: "TCS", verifyPage: "https://www.tcs.com/careers" },
  { slug: "infosys", name: "Infosys", verifyPage: "https://www.infosys.com/careers/apply.html" },
  { slug: "wipro", name: "Wipro", verifyPage: "https://careers.wipro.com" },
  { slug: "cognizant", name: "Cognizant", verifyPage: "https://careers.cognizant.com" },
  { slug: "accenture", name: "Accenture", verifyPage: "https://www.accenture.com/in-en/careers" },
  { slug: "capgemini", name: "Capgemini", verifyPage: "https://www.capgemini.com/careers" },
  { slug: "deloitte", name: "Deloitte", verifyPage: "https://www2.deloitte.com/in/en/careers.html" },
  { slug: "amazon", name: "Amazon", verifyPage: "https://www.amazon.jobs" },
];

// ---------------------------------------------------------------------------
// 2. DRIVES (PRD §12.3) — every "// TODO(verify)" field must be checked against
// the official page by a human before the demo. regDeadline stays null until the
// page states a real date (UI then shows "date unconfirmed" honestly).
// ---------------------------------------------------------------------------
const DRIVES = [
  {
    companyName: "TCS",
    program: "NQT",
    role: "Assistant System Engineer",
    batch: "2027",
    type: "OFF",
    // TODO(verify): tcs.com NQT registration status + printed dates
    regDeadline: null,
    testDate: null,
    salary: "", // TODO(verify): exactly what the page states
    openings: "", // TODO(verify)
    eligibility: {
      tenthMin: 60, // TODO(verify) against official criteria
      twelfthMin: 60,
      cgpaMin: 6.0,
      maxBacklogs: 1,
      branches: ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"],
    },
    roundsInfo:
      "TODO(verify): paste the official rounds summary (aptitude test → technical interview → HR) from the source page here.",
    sourceUrl: "https://www.tcs.com/careers", // TODO(verify): exact page you read
    sourceName: "tcs.com",
    status: "TENTATIVE",
  },
  {
    companyName: "Infosys",
    program: "Off Campus Hiring",
    role: "Systems Engineer",
    batch: "2027",
    type: "OFF",
    regDeadline: null, testDate: null,
    salary: "", openings: "",
    eligibility: { tenthMin: 60, twelfthMin: 60, cgpaMin: 6.0, maxBacklogs: 1, branches: ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "OTHER"] },
    roundsInfo: "TODO(verify): paste the official rounds summary from infosys.com/careers/apply.html.",
    sourceUrl: "https://www.infosys.com/careers/apply.html",
    sourceName: "infosys.com",
    status: "TENTATIVE",
  },
  {
    companyName: "Wipro",
    program: "Elite NTH",
    role: "Project Engineer",
    batch: "2027",
    type: "ON",
    regDeadline: null, testDate: null,
    salary: "", openings: "",
    eligibility: { tenthMin: 60, twelfthMin: 60, cgpaMin: 6.0, maxBacklogs: 1, branches: ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"] },
    roundsInfo: "TODO(verify): paste the official Elite NTH rounds summary from careers.wipro.com.",
    sourceUrl: "https://careers.wipro.com",
    sourceName: "careers.wipro.com",
    status: "TENTATIVE",
  },
  {
    companyName: "Cognizant",
    program: "GenC",
    role: "Programmer Analyst Trainee",
    batch: "2027",
    type: "ON",
    regDeadline: null, testDate: null,
    salary: "", openings: "",
    eligibility: { tenthMin: 60, twelfthMin: 60, cgpaMin: 7.5, maxBacklogs: 0, branches: ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"] },
    roundsInfo: "TODO(verify): paste the official GenC rounds summary from careers.cognizant.com.",
    sourceUrl: "https://careers.cognizant.com",
    sourceName: "careers.cognizant.com",
    status: "TENTATIVE",
  },
  {
    companyName: "Accenture",
    program: "Associate Software Engineer",
    role: "Associate Software Engineer",
    batch: "2027",
    type: "OFF",
    regDeadline: null, testDate: null,
    salary: "", openings: "",
    eligibility: { tenthMin: 65, twelfthMin: 65, cgpaMin: 6.5, maxBacklogs: 0, branches: ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "OTHER"] },
    roundsInfo: "TODO(verify): paste the official rounds summary from accenture.com India careers.",
    sourceUrl: "https://www.accenture.com/in-en/careers",
    sourceName: "accenture.com",
    status: "TENTATIVE",
  },
  {
    companyName: "Capgemini",
    program: "Analyst Recruit",
    role: "Analyst",
    batch: "2027",
    type: "OFF",
    regDeadline: null, testDate: null,
    salary: "", openings: "",
    eligibility: { tenthMin: 60, twelfthMin: 60, cgpaMin: 6.0, maxBacklogs: 1, branches: ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"] },
    roundsInfo: "TODO(verify): paste the official Analyst Recruit rounds summary from capgemini.com.",
    sourceUrl: "https://www.capgemini.com/careers",
    sourceName: "capgemini.com",
    status: "TENTATIVE",
  },
  {
    companyName: "Deloitte",
    program: "Analyst (Consulting)",
    role: "Analyst",
    batch: "2027",
    type: "ON",
    regDeadline: null, testDate: null,
    salary: "", openings: "",
    eligibility: { cgpaMin: 7.0, branches: ["CSE", "IT", "ECE"] },
    roundsInfo: "TODO(verify): paste the official Analyst hiring rounds summary from deloitte.com India careers.",
    sourceUrl: "https://www2.deloitte.com/in/en/careers.html",
    sourceName: "deloitte.com",
    status: "TENTATIVE",
  },
  {
    companyName: "Amazon",
    program: "SDE Intern",
    role: "Software Development Engineer Intern",
    batch: "2027",
    type: "OFF",
    regDeadline: null, testDate: null,
    salary: "", openings: "",
    eligibility: { cgpaMin: 7.0 },
    roundsInfo: "TODO(verify): paste the official loops summary (OA → interviews) from amazon.jobs University hiring.",
    sourceUrl: "https://www.amazon.jobs",
    sourceName: "amazon.jobs",
    status: "TENTATIVE",
  },
];

// ---------------------------------------------------------------------------
// 3. DEMO ACCOUNT — Kiran (PRD §12.5).
//    Activities MUST carry your own real, working links (builder's projects /
//    certificates / LeetCode profile). Cut anything you cannot genuinely link —
//    a dead link on the "Every item evidence-linked" portfolio kills USP 2.
// ---------------------------------------------------------------------------
const DEMO_PROFILE = {
  name: "Kiran",
  college: "TODO(verify): your college",
  branch: "CSE",
  year: 3,
  tenth: 89,
  twelfth: 84,
  cgpa: 7.8,
  backlogs: 0,
  targetRole: "Data Analyst",
  portfolioSlug: "kiran",
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d;
};

// Score target ≈56 per PRD §13 worked example: 2 projects (30) + 1 cert (10)
// + 1 course (5) + 4 DSA (8) + a 5-day streak (2.5) = 55.5 → 56.
const DEMO_ACTIVITIES = [
  { type: "PROJECT", title: "SQL sales analysis", summary: "Queries + reporting over a real retail dataset.", url: "REPLACE_ME——PASTE_YOUR_REAL_URL", tags: ["sql"], date: daysAgo(14) },
  { type: "PROJECT", title: "Power BI dashboard", summary: "Sales KPI dashboard with drill-down pages.", url: "REPLACE_ME——PASTE_YOUR_REAL_URL", tags: ["power-bi"], date: daysAgo(10) },
  { type: "COURSE", title: "Data analysis with Python", summary: "Pandas, NumPy and matplotlib basics.", url: "REPLACE_ME——PASTE_YOUR_REAL_URL", tags: ["python"], date: daysAgo(21) },
  { type: "CERT", title: "SQL certificate", summary: "Certificate of completion.", url: "REPLACE_ME——PASTE_YOUR_REAL_URL", tags: ["sql"], date: daysAgo(4) },
  { type: "DSA", title: "Practice set 1", summary: "Easy–medium array problems.", url: "REPLACE_ME——PASTE_YOUR_REAL_URL", tags: ["dsa"], date: daysAgo(3) },
  { type: "DSA", title: "Practice set 2", summary: "Strings + hash maps set.", url: "REPLACE_ME——PASTE_YOUR_REAL_URL", tags: ["dsa"], date: daysAgo(2) },
  { type: "DSA", title: "Practice set 3", summary: "Two-pointer problems.", url: "REPLACE_ME——PASTE_YOUR_REAL_URL", tags: ["dsa"], date: daysAgo(1) },
  { type: "DSA", title: "Practice set 4", summary: "Timed medium set.", url: "REPLACE_ME——PASTE_YOUR_REAL_URL", tags: ["dsa"], date: daysAgo(0) },
];

// Demo board (PRD §12.5): all six columns; OFFER deliberately empty for the live demo.
const DEMO_BOARD = [
  { program: "NQT", company: "TCS", status: "APPLIED" },
  { program: "Off Campus Hiring", company: "Infosys", status: "OA" },
  { program: "Elite NTH", company: "Wipro", status: "SAVED" },
  { program: "Associate Software Engineer", company: "Accenture", status: "SAVED" },
  { program: "GenC", company: "Cognizant", status: "INTERVIEW" },
  { program: "Analyst Recruit", company: "Capgemini", status: "REJECTED" },
];

// ---------------------------------------------------------------------------

async function seedCompanies() {
  const batch = db.batch();
  for (const c of COMPANIES) {
    batch.set(db.collection("companies").doc(c.slug), { name: c.name, slug: c.slug, verifyPage: c.verifyPage });
  }
  await batch.commit();
  console.log(`✔ companies: ${COMPANIES.length} upserted`);
}

async function seedDrives() {
  const batch = db.batch();
  for (const d of DRIVES) {
    const id = driveId(d.companyName, d.program, d.batch);
    batch.set(db.collection("drives").doc(id), {
      companyName: d.companyName,
      companySlug: slugify(d.companyName),
      initials: d.companyName.slice(0, 2).toUpperCase(),
      // colors rotate the Design.md token palette
      color: ["#4F46E5", "#059669", "#D97706", "#DB2777", "#0E7490", "#7C3AED", "#CA8A04", "#DC2626"][DRIVES.indexOf(d) % 8],
      program: d.program,
      role: d.role,
      batch: d.batch,
      type: d.type,
      regDeadline: d.regDeadline ? Timestamp.fromDate(new Date(d.regDeadline)) : null,
      testDate: d.testDate ? Timestamp.fromDate(new Date(d.testDate)) : null,
      salary: d.salary,
      openings: d.openings,
      eligibility: d.eligibility,
      roundsInfo: d.roundsInfo,
      sourceUrl: d.sourceUrl,
      sourceName: d.sourceName,
      status: d.status,
      verifiedAt: Timestamp.fromDate(new Date()),
    });
    console.log(`✔ ${id} [${d.status}] verified from ${d.sourceUrl}${d.regDeadline ? "" : " — date unconfirmed"}`);
  }
  await batch.commit();
  console.log(
    "\n⚠ VERIFICATION CHECKLIST (PRD §12.1):\n" +
      "  1. Open every sourceUrl above; set real regDeadline/testDate where the page states one.\n" +
      "  2. Promote those rows to status: 'CONFIRMED'; leave the rest TENTATIVE.\n" +
      "  3. Fill salary/openings/roundsInfo/eligibility exactly as the page states.\n" +
      "  4. Re-run this script — it is idempotent and refreshes verifiedAt.\n"
  );
}

function demoReadyActivities() {
  return DEMO_ACTIVITIES.filter((a) => !a.url.includes("REPLACE_ME"));
}

async function seedDemoUser() {
  const real = demoReadyActivities();
  if (!DEMO_UID) {
    console.log("ℹ Skipping demo account — pass your signed-in Google uid: node scripts/seed.mjs --uid=YOUR_UID");
    return;
  }
  if (real.length !== DEMO_ACTIVITIES.length) {
    console.error(
      "\n[DriveDeck] DEMO_ACTIVITIES still contains placeholder links.\n" +
        "PRD §12.5: every activity needs YOUR real, working URL (projects, certificate, LeetCode profile).\n" +
        "Paste them into DEMO_ACTIVITIES in scripts/seed.mjs, then re-run with --uid=YOUR_UID.\n" +
        "Companies and drives have been seeded; the demo portfolio stays empty rather than fake.\n"
    );
    return;
  }

  const users = db.collection("users").doc(DEMO_UID);
  const slugRef = db.collection("usernames").doc("kiran");

  const slugSnap = await slugRef.get();
  if (slugSnap.exists && slugSnap.data().uid !== DEMO_UID) {
    console.error(`\n[DriveDeck] usernames/kiran already belongs to ${slugSnap.data().uid} — refusing to hijack.\n`);
    process.exit(1);
  }

  const batch = db.batch();
  batch.set(users, { ...DEMO_PROFILE, email: `${DEMO_UID}@demo.local`, createdAt: serverTimestamp() });
  batch.set(slugRef, { uid: DEMO_UID });

  for (const a of DEMO_ACTIVITIES) {
    // activities is a top-level collection (public read for portfolios)
    batch.set(db.collection("activities").doc(), {
      uid: DEMO_UID,
      type: a.type,
      title: a.title,
      summary: a.summary,
      url: a.url,
      tags: a.tags,
      date: Timestamp.fromDate(a.date),
      createdAt: serverTimestamp(),
    });
  }

  for (const row of DEMO_BOARD) {
    const dId = driveId(row.company, row.program, "2027");
    batch.set(db.collection("applications").doc(applicationId(DEMO_UID, dId)), {
      uid: DEMO_UID,
      driveId: dId,
      status: row.status,
      history: [{ status: row.status, at: Timestamp.fromDate(daysAgo(3)) }],
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  console.log("✔ demo user users/" + DEMO_UID + " + usernames/kiran + activities + applications seeded");
  console.log("  → blueprint ready: sign in with that Google account on localhost,Kirans /u/kiran renders live");
}

(async () => {
  await seedCompanies();
  await seedDrives();
  await seedDemoUser();
  process.exit(0);
})().catch((err) => {
  console.error("\n[DriveDeck] Seed failed:", err);
  process.exit(1);
});
