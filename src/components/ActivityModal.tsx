import { useEffect, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { X } from "lucide-react";
import { db } from "../lib/firebase";
import type { Activity } from "../lib/types";
import { COPY } from "../lib/copy";

interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
  uid: string;
  /** edit mode target */
  editing?: Activity | null;
}

const URL_RE = /^https?:\/\/.+/;
const SUMMARY_MAX = 140;

// Design.md 3.20 — bottom sheet on mobile, centered modal on desktop.
// The Evidence Rule enforced here client-side, and again by firestore.rules rule 5.
export function ActivityModal({ open, onClose, uid, editing }: ActivityModalProps) {
  const [type, setType] = useState<Activity["type"]>("PROJECT");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  // prefill / reset on open
  useEffect(() => {
    if (open) {
      if (editing) {
        setType(editing.type);
        setTitle(editing.title);
        setSummary(editing.summary);
        setUrl(editing.url);
        setTags(editing.tags.join(", "));
        setDate(editing.date.toDate().toISOString().slice(0, 10));
      } else {
        setType("PROJECT");
        setTitle("");
        setSummary("");
        setUrl("");
        setTags("");
        setDate(new Date().toISOString().slice(0, 10));
      }
      setSaving(false);
    }
  }, [open, editing]);

  if (!open) return null;

  const validTitle = title.trim().length > 0;
  const validUrl = URL_RE.test(url.trim()); // must include protocol — the Evidence Rule
  const canSave = validTitle && validUrl && !saving;
  const dirty = Boolean(title || summary || url || tags);

  function handleBackdrop() {
    if (dirty && !confirm(COPY.growth.discardConfirm)) return;
    onClose();
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3);
    const payload = {
      uid,
      type,
      title: title.trim(),
      summary: summary.trim().slice(0, SUMMARY_MAX),
      url: url.trim(),
      tags: tagList,
      date: Timestamp.fromDate(new Date(`${date}T12:00:00`)),
    };
    try {
      if (editing) {
        await updateDoc(doc(db, "activities", editing.id), payload);
      } else {
        await addDoc(collection(db, "activities"), { ...payload, createdAt: serverTimestamp() });
      }
      onClose();
    } catch (err) {
      // Rules deny only if a bypassed write misses the Evidence Rule — surface offline catch-all
      alert(err instanceof Error && err.message.includes("offline") ? COPY.growth.toastOffline : COPY.growth.linkError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 lg:grid lg:place-items-center">
      <div className="absolute inset-0 bg-ink/20" onClick={handleBackdrop} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={COPY.growth.modalTitle}
        className="absolute bottom-0 w-full bg-surface rounded-t-xl shadow-elev p-4 max-h-[90vh] overflow-y-auto lg:relative lg:w-full lg:max-w-[480px] lg:rounded-xl lg:max-h-[85vh]"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">{COPY.growth.modalTitle}</h2>
          <button
            type="button"
            aria-label={COPY.growth.cancel}
            onClick={handleBackdrop}
            className="p-2 -m-2 text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-brand rounded-md"
          >
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {COPY.growth.typeChips.map((label, i) => {
            const key = (["PROJECT", "CERT", "COURSE", "DSA", "ACHIEVEMENT"] as const)[i];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                className={`h-8 px-3 rounded-full text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand ${type === key ? "bg-brand text-white" : "bg-canvas text-ink-muted border border-line hover:bg-line/60"}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <label className="block mb-3">
          <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.growth.fields.title}</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-line bg-canvas text-[15px] focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
          {title.length > 0 && !validTitle && <span className="text-[13px] text-danger mt-1">{COPY.growth.titleError}</span>}
        </label>

        <label className="block mb-3">
          <span className="flex justify-between text-[13px] font-medium text-ink-muted mb-1">
            <span>{COPY.growth.fields.summary}</span>
            <span>{COPY.growth.summaryCount(summary.length)}</span>
          </span>
          <input
            value={summary}
            maxLength={SUMMARY_MAX}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-line bg-canvas text-[15px] focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>

        <label className="block mb-1">
          <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.growth.fields.link}</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            inputMode="url"
            placeholder="https://"
            className={`w-full h-11 px-3 rounded-lg border bg-canvas text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              url && !validUrl ? "border-danger" : "border-line focus:border-brand"
            }`}
          />
          <span className={`block text-[13px] mt-1 ${url && !validUrl ? "text-danger" : "text-ink-muted"}`}>
            {url && !validUrl ? COPY.growth.linkError : COPY.growth.linkHelper}
          </span>
        </label>

        <label className="block mb-3">
          <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.growth.fields.tags}</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-line bg-canvas text-[15px] focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
          <span className="block text-[13px] text-ink-muted mt-1">{COPY.growth.tagsHelper}</span>
        </label>

        <label className="block mb-6">
          <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.growth.fields.date}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-line bg-canvas text-[15px] focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 h-11 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {saving ? "…" : COPY.growth.save}
          </button>
          <button
            type="button"
            onClick={handleBackdrop}
            className="flex-1 h-11 rounded-lg border border-line text-[15px] font-semibold text-ink hover:bg-canvas transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {COPY.growth.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
