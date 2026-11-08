import { GoogleAuthProvider } from "firebase/auth";

// PRD §10.1 — Google is the only auth provider in v1.
// GitHub/LinkedIn are saved profile URLs (regex-validated), never OAuth.
export const googleProvider = new GoogleAuthProvider();
// force account chooser so a shared family device can switch students
googleProvider.setCustomParameters({ prompt: "select_account" });
