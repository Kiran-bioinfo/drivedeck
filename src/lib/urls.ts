// Render-time destination guard (audit: stored URLs are trusted too broadly).
//
// `rel="noopener"` only stops window.opener access — it does NOT validate where
// a link goes. Stored profile/activity URLs are untrusted data, so the scheme is
// checked again here before anything is used as an href. This blocks
// javascript:, data:, vbscript: and other non-http(s) payloads that could have
// been written before the rules validated them (or by the seed script).
//
// http(s) only — a protocol-relative "//host" is deliberately rejected too.
export function safeHttpUrl(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  const u = raw.trim();
  if (!u) return undefined;
  return /^https?:\/\//i.test(u) ? u : undefined;
}
