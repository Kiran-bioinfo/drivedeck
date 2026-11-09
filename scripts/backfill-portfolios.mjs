// scripts/backfill-portfolios.mjs — one-time migration for the public/private split.
//
// WHY THIS EXISTS
//   firestore.rules now keeps /users/{uid} OWNER-ONLY (email, 10th/12th %, CGPA,
//   backlogs are private) and serves the public /u/{slug} page from
//   /portfolios/{uid} — Firestore rules cannot hide fields inside a readable
//   document, so the two had to become separate documents.
//
//   Profiles created BEFORE that split only exist in /users/{uid}. Without this
//   backfill their public portfolio would render the designed 404.
//
//   This copies the DISPLAY-SAFE fields only. Private fields never leave
//   /users/{uid}, and firestore.rules would reject them if they tried.
//
// Usage:
//   node scripts/backfill-portfolios.mjs           # only fill missing portfolios
//   node scripts/backfill-portfolios.mjs --force   # overwrite existing ones too

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const serverTimestamp = () => FieldValue.serverTimestamp();

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

const keyJson = JSON.parse(fs.readFileSync(keyPath, "utf8"));

// Same guard as seed.mjs: never write into a project the app does not point at.
const envProject = (() => {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return null;
  const m = fs.readFileSync(envPath, "utf8").match(/^VITE_FIREBASE_PROJECT_ID=(.+)$/m);
  return m ? m[1].trim() : null;
})();
const FORCE = process.argv.includes("--force");
if (envProject && keyJson.project_id !== envProject) {
  console.error(
    `\n[DriveDeck] REFUSING TO MIGRATE: the service account targets "${keyJson.project_id}" ` +
      `but .env points at "${envProject}".\n` +
      "Re-run with --force if this really is intended.\n"
  );
  if (!FORCE) process.exit(1);
  console.warn(`⚠ --force: continuing against "${keyJson.project_id}" anyway.\n`);
}

initializeApp({ credential: cert(keyPath) });
const db = getFirestore();

// MUST stay in sync with PublicProfile (src/lib/types.ts) and the allow-list in
// firestore.rules rule 2 — anything else is rejected by the rules anyway.
const PUBLIC_FIELDS = [
  "name",
  "college",
  "branch",
  "year",
  "targetRole",
  "portfolioSlug",
  "githubUrl",
  "linkedinUrl",
];

const CHUNK = 400; // Firestore batches cap at 500 ops

(async () => {
  const snap = await db.collection("users").get();
  if (snap.empty) {
    console.log("ℹ No profiles found — nothing to backfill.");
    process.exit(0);
  }

  let written = 0;
  let skipped = 0;
  let chunk = [];
  const flush = async () => {
    if (!chunk.length) return;
    await Promise.all(chunk);
    chunk = [];
  };

  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.name || !data.portfolioSlug) {
      console.warn(`⚠ skip ${doc.id}: profile is missing name/portfolioSlug`);
      skipped++;
      continue;
    }

    const target = db.collection("portfolios").doc(doc.id);
    if (!FORCE) {
      const existing = await target.get();
      if (existing.exists) {
        skipped++;
        continue;
      }
    }

    // display-safe fields only — private data stays in /users/{uid}
    const pub = { createdAt: data.createdAt ?? serverTimestamp() };
    for (const f of PUBLIC_FIELDS) {
      if (data[f] !== undefined) pub[f] = data[f];
    }

    chunk.push(target.set(pub).then(() => undefined));
    written++;
    if (chunk.length >= CHUNK) await flush();
  }
  await flush();

  console.log(`✔ portfolios backfilled: ${written} written, ${skipped} skipped`);
  console.log("  public /u/{slug} pages now read from /portfolios/{uid}.");
  process.exit(0);
})().catch((err) => {
  console.error("\n[DriveDeck] Backfill failed:", err);
  process.exit(1);
});
