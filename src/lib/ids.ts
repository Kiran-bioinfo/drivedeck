// Deterministic document IDs — Architecture.md Sheet 3.3.
// Never string-build IDs inside a page; import these helpers.

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// drives/{company}_{program}_{batch} — e.g. tcs_nqt_2027. Same triple → same doc.
export function driveId(company: string, program: string, batch: string): string {
  return `${slugify(company)}_${slugify(program)}_${slugify(batch)}`;
}

// applications/{uid}_{driveId} — Architecture.md Sheet 9.3: one drive application per student,
// created only from DriveDetail; tapping "Save to board" twice writes the same document.
export function applicationId(uid: string, driveId: string): string {
  return `${uid}_${driveId}`;
}
