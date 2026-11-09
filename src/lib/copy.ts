// UI strings — verbatim from PRD.md §7, §10.1 and the build-time additions in PRD §7.1.
// Never invent copy inline: add the string to PRD.md §7 first, then import it here.

export const COPY = {
  landing: {
    h1: "From 3rd year to offer letter.",
    support: "Every drive with a verified date. Your prep, scored. Your portfolio, built automatically.",
    primaryCta: "Start free — 2 min",
    secondaryCta: "See a live portfolio",
    navFeatures: "Features",
    navHow: "How it works",
    navResources: "Resources",
    navGetStarted: "Get started",
    cards: [
      {
        title: "Deadlines you can trust",
        body: "Every drive shows its source link and the date we last checked it. No forwards, no fake dates.",
      },
      {
        title: "One board for your pipeline",
        body: "Drag every application from Saved to Offer. See exactly where you stand.",
      },
      {
        title: "Your portfolio builds itself",
        body: "Log a project or certificate with its link once — your live portfolio updates on its own.",
      },
    ],
    trust: "Verified deadlines · No spam · Free for students",
    footer: "Built for JioCoder Hackathon 2026",
    signInTitle: "Create your DriveDeck",
    signInBody: "One tap with Google — your board, score and portfolio are ready in 2 minutes.",
    signInButton: "Continue with Google",
    signInLoading: "Signing you in…",
    signInError: "Google sign-in didn't open — allow popups for this site and try again.",
    ctaTitle: "Your offer letter starts here.",
    howSteps: [
      "Sign in with Google — 2 minutes of setup, either setup.",
      "Save verified drives that match your profile.",
      "Log evidence with its link — your score and portfolio update themselves.",
    ],
    footerMarquee: [
      "Verified drives",
      "Kanban application board",
      "Auto-built portfolio",
      "Zero fake dates",
      "Free for students",
    ],
    footerRights: "© 2026 DriveDeck. All rights reserved.",
    footerMadePre: "Made for",
    footerMadePost: "JioCoder Hackathon 2026",
    footerBackToTop: "Back to top",
  },
  nav: {
    home: "Home",
    drives: "Drives",
    board: "Board",
    portfolio: "Portfolio",
    addEvidence: "Add evidence",
    signOut: "Sign out",
  },
  onboarding: {
    step1: "Your profile",
    step2: "Your portfolio address",
    step3: "Starter checklist",
    stepOf: (n: number) => `Step ${n} of 3`,
    slugHelper: "Your portfolio will live at drivedeck.pages.dev/u/ …",
    slugAvailable: (slug: string) => `Nice — ${slug} is available.`,
    slugTaken: (slug: string) => `${slug} is taken — try ${slug}_26 or add your batch year.`,
    slugReserved: (slug: string) => `${slug} is reserved — try ${slug}_26 or add your batch year.`,
    slugInvalid: "Use 3–20 lowercase letters, numbers or underscores.",
    slugChecking: "Checking…",
    slugPlaceholder: "yourname",
    continue: "Continue",
    back: "Back",
    finish: "Go to dashboard",
    finishing: "Setting up your dashboard…",
    finishOffline: "Couldn't save your profile — check your connection and try again.",
    starter: ["Save your first drive", "Log one piece of evidence", "Share your portfolio link"],
    githubHelper: "Optional — your GitHub profile URL, shown on your portfolio.",
    linkedinHelper: "Optional — your LinkedIn profile URL, shown on your portfolio.",
    githubInvalid: "Must start with https://github.com/",
    linkedinInvalid: "Must start with https://linkedin.com/in/",
    fields: {
      name: "Name",
      college: "College",
      branch: "Branch",
      year: "Year",
      targetRole: "Target role",
      tenth: "10th %",
      twelfth: "12th %",
      cgpa: "CGPA",
      backlogs: "Backlogs",
      github: "GitHub URL",
      linkedin: "LinkedIn URL",
    },
    validation: {
      name: "Enter your name.",
      college: "Enter your college.",
      branch: "Pick your branch.",
      targetRole: "Pick a target role.",
      tenth: "10th % must be between 0 and 100.",
      twelfth: "12th % must be between 0 and 100.",
      cgpa: "CGPA must be between 0 and 10.",
      backlogs: "Backlogs must be 0 or higher.",
    },
  },
  dashboard: {
    greeting: (first: string) => `Hi ${first}`,
    readiness: "Readiness",
    how: "How this is calculated",
    streak: (n: number) => `${n}-day streak`,
    focusLogDsa: (n: number) => `Log today's practice set — keep the ${n}-day streak.`,
    focusDeadline: (company: string, program: string, n: number) => `${company} ${program} closes in ${n}d — read the rounds breakdown.`,
    focusProject: "Your portfolio has no projects yet — one is worth 15 points.",
    focusClear: "You're on top of everything — browse drives.",
    watch: (n: string) => `${n} upcoming drives match your profile`,
    watchEmpty: "No drives match your profile yet. Browse all drives.",
    formulaTitle: "How your Readiness Score is calculated",
    formulaFootnote: "Computed from your evidence log only. Nothing here can be edited by hand.",
    formulaProjects: "Projects",
    formulaCerts: "Certificates",
    formulaCourses: "Courses",
    formulaDsa: "Practice sets",
    formulaStreak: "Streak bonus",
    formulaDsaCap: "(first 20 counted)",
    deadlinesEmpty: "No drives match these filters yet. Try All drives.",
  },
  drives: {
    filters: ["All", "Match me", "On campus", "Off campus"] as const,
    searchPlaceholder: "Search company, program or role",
    badgeMatch: "You match",
    badgeMissing: "Add your CGPA to check",
    criteriaPending: "Criteria not published yet",
    closed: "Closed",
    typeOn: "On campus",
    typeOff: "Off campus",
    tentativeNote: "TENTATIVE — date unconfirmed",
    roundsHeader: "Selection rounds",
    viewOfficial: "View official page",
    saveToBoard: "Save to board",
    apply: "Apply",
    saved: "Saved",
    applied: "Applied",
    removeFromBoard: "Remove from board",
    addToCalendar: "Add to calendar (.ics)",
    icsDisabled: "Date not yet confirmed by the source",
    empty: "No drives match these filters yet. Try All drives.",
    toastSaved: "Saved to your board",
    toastApplied: "Applied to this drive",
    toastMissing: "That drive is no longer available.",
    badgeFail: (label: string, value: string) => `${label} below ${value}`,
    badgeBacklogs: (value: string) => `Backlogs above ${value}`,
    badgeBranch: (list: string) => `Open to: ${list}`,
    row: (label: string, need: string, have: string) => `${label}: need ${need} · you have ${have}`,
    allBranches: "All branches eligible",
    salary: "Salary",
    openings: "Openings",
  },
  board: {
    emptyColumn: "Drop here once you've applied.",
    emptyBoard: "Save a drive and it will appear here as a card.",
    ageChip: (n: number) => `${n}d here`,
    toastMove: (stage: string) => `Moved to ${stage}`,
    toastOffer: "Offer! Congratulations",
    remove: "Remove",
    removeConfirm: "Remove this application? Its history will be deleted.",
    driveGone: "Drive no longer available",
    menuLabel: "Card menu",
    moveTo: "Move to",
  },
  growth: {
    fab: "Add evidence",
    modalTitle: "Log evidence",
    typeChips: ["Project", "Certificate", "Course", "DSA", "Achievement"] as const,
    linkHelper: "GitHub, live site or credential URL — the link is the proof.",
    linkError: "A link is required — that's the evidence rule.",
    linkOptional: "Image attached — the link becomes optional.",
    titleError: "Title is required.",
    summaryCount: (n: number) => `${n}/140`,
    linked: "Linked",
    preview: "View public page",
    empty: "No evidence yet. Your first project is worth 15 points.",
    emptyCta: "Log your first",
    save: "Save",
    cancel: "Cancel",
    discardConfirm: "Discard this entry?",
    fields: {
      title: "Title",
      summary: "One-line summary",
      link: "Link",
      tags: "Tags (max 3)",
      date: "Date",
    },
    tagsHelper: "Comma-separated, max 3.",
    toastSaved: "Evidence saved — portfolio updated",
    toastOffline: "You're offline — changes will retry when you're back",
    delete: "Delete",
    deleteConfirm: "Delete this evidence? It will also disappear from your portfolio.",
    toastDeleted: "Evidence deleted",
    imageAdd: "Add image",
    imageChange: "Change image",
    imageCompressing: "Compressing image…",
    imageRemove: "Remove",
    imageHelper: "Optional — shown with the evidence row. Compressed automatically.",
    imageRetained: (kb: number) => `Image added — compressed to ${kb} KB`,
    imageBadType: "Use a JPEG, PNG or WebP image.",
    imageTooLarge: "That image is too large to compress (over 10 MB).",
    imageUncompressable: "This image can't be compressed small enough — try another.",
  },
  portfolio: {
    badge: "Every item evidence-linked",
    subline: (role: string, year: number, branch: string) => `${role} · ${year}${year === 1 ? "st" : year === 2 ? "nd" : year === 3 ? "rd" : "th"} year, ${branch}`,
    sections: {
      projects: "Projects",
      certs: "Certifications & courses",
      dsa: "DSA consistency",
      achievements: "Achievements",
      timeline: "Growth timeline",
    },
    dsaLine: (n: number, s: number) => `${n} practice sets logged · ${s}-day streak`,
    share: "Share portfolio",
    toastCopied: "Portfolio link copied",
    empty: (name: string) => `${name} hasn't logged evidence yet.`,
    footer: "Live portfolio by DriveDeck — build yours free",
    notFoundTitle: "This portfolio doesn't exist (yet).",
    notFoundBody: "Slugs are unique — maybe the letter O is a zero.",
    claim: "Claim your own",
  },
  notFound: {
    title: "404",
    body: "This page doesn't exist.",
    cta: "Back to home",
  },
  system: {
    signedOut: "Signed out",
  },
  resources: {
    h1: "Prep resources that actually help.",
    sub: "Curated by hand, every link checked. No filler.",
  },
} as const;

// PRD §7 — deadline chip wordings
export function chipText(company: string, program: string, days: number, today: boolean, closed: boolean): string {
  if (closed) return "Closed";
  if (today) return company && program ? `${company} ${program} closes today` : "closes today";
  return `${company} ${program} closes in ${days}d`;
}

// Portfolio URL — always the origin the app is actually running on:
// http://localhost:5199/u/kiran on localhost, https://drivedeck.pages.dev/u/kiran in production.
export function portfolioUrl(slug: string): string {
  return `${window.location.origin}/u/${slug}`;
}

// Portfolio link-button label helper — PRD §F5: github.com → GitHub; vercel/netlify → Live; else Credential
export function linkLabel(url: string): string {
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    return "Credential";
  }
  if (host === "github.com" || host.endsWith(".github.com")) return "GitHub";
  if (host.endsWith("vercel.app") || host.endsWith("netlify.app")) return "Live";
  return "Credential";
}

// Resources page — PRD §10.1: ~8 links, each verified by hand; official pages only.
export const RESOURCES: { title: string; url: string; why: string }[] = [
  { title: "LeetCode", url: "https://leetcode.com", why: "DSA practice: easy–medium sets before online tests." },
  { title: "Roadmap.sh", url: "https://roadmap.sh", why: "Step-by-step maps for SDE, data analyst and QA paths." },
  { title: "SQLBolt", url: "https://sqlbolt.com", why: "Interactive SQL lessons — most analyst rounds start here." },
  { title: "HackerRank", url: "https://www.hackerrank.com", why: "Skill certifications and assessments used by hiring teams." },
  { title: "freeCodeCamp", url: "https://www.freecodecamp.org", why: "Free full courses, including Python and data analysis." },
  { title: "TCS Careers", url: "https://www.tcs.com/careers", why: "Where NQT registration actually opens — check the source first." },
  { title: "Infosys Careers", url: "https://www.infosys.com/careers/apply.html", why: "Official apply page — no forwards, no fake dates." },
  { title: "Amazon Jobs", url: "https://www.amazon.jobs", why: "University and entry-level roles, direct from the source." },
];
