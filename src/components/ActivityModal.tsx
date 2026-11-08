import { useEffect, useRef, useState } from "react";
import { addDoc, collection, deleteField, doc, serverTimestamp, Timestamp, updateDoc, type FieldValue } from "firebase/firestore";
import { ImagePlus, Loader2, X } from "lucide-react";
import { db } from "../lib/firebase";
import { compressImageFile, dataUriBytes, imageErrorKey } from "../lib/image";
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

  // PRD §7.2 — optional evidence image: string = set · null = removed · initial from editing
  const [image, setImage] = useState<string | null>(null);
  const [imageKB, setImageKB] = useState<number | null>(null);
  const [imageErr, setImageErr] = useState<"imageBadType" | "imageTooLarge" | "imageUncompressable" | null>(null);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
        setImage(editing.image ?? null); // null here also means "no image yet"
        setImageKB(null);
        setImageErr(null);
      } else {
        setType("PROJECT");
        setTitle("");
        setSummary("");
        setUrl("");
        setTags("");
        setDate(new Date().toISOString().slice(0, 10));
        setImage(null);
        setImageKB(null);
        setImageErr(null);
      }
      setSaving(false);
    }
  }, [open, editing]);

  if (!open) return null;

  const validTitle = title.trim().length > 0;
  const validUrl = URL_RE.test(url.trim()); // must include protocol — the Evidence Rule
  const canSave = validTitle && validUrl && !saving && !compressing;
  const dirty = Boolean(title || summary || url || tags) || image !== null && image !== (editing?.image ?? null);

  function handleBackdrop() {
    if (dirty && !confirm(COPY.growth.discardConfirm)) return;
    onClose();
  }

  async function handlePickImage(file?: File | null) {
    if (!file) return;
    setImageErr(null);
    setCompressing(true);
    try {
      const dataUrl = await compressImageFile(file);
      setImage(dataUrl);
      setImageKB(Math.max(1, Math.round(dataUriBytes(dataUrl) / 1024)));
    } catch (e) {
      setImageErr(imageErrorKey(e) as "imageBadType" | "imageTooLarge" | "imageUncompressable");
    } finally {
      setCompressing(false);
      if (fileRef.current) fileRef.current.value = ""; // allow re-picking the same file
    }
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3);
    const payload: { uid: string; type: Activity["type"]; title: string; summary: string; url: string; tags: string[]; date: Timestamp; image?: string | FieldValue } = {
      uid,
      type,
      title: title.trim(),
      summary: summary.trim().slice(0, SUMMARY_MAX),
      url: url.trim(),
      tags: tagList,
      date: Timestamp.fromDate(new Date(`${date}T12:00:00`)),
    };
    // PRD §7.2 image lifecycle: set → write string; cleared → delete the field;
    // untouched existing image → omit (keeps the document value)
    const existingImage = editing?.image ?? null;
    if (image) payload.image = image;
    else if (existingImage != null) payload.image = deleteField();
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

        {/* PRD §7.2 — optional image, compressed client-side before save */}
        <div className="mb-6">
          <span className="block text-[13px] font-medium text-ink-muted mb-1">Image</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => handlePickImage(e.target.files?.[0])}
          />
          <div className="flex items-start gap-3">
            {image && (
              <img
                src={image}
                alt="Evidence preview"
                className="w-20 h-20 object-cover rounded-lg border border-line shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={compressing}
                  onClick={() => fileRef.current?.click()}
                  className="h-10 px-3 rounded-lg border border-line bg-canvas text-[14px] font-medium text-ink hover:bg-line/40 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 flex items-center gap-2"
                >
                  {compressing ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ImagePlus size={16} strokeWidth={2} aria-hidden />}
                  {image ? COPY.growth.imageChange : COPY.growth.imageAdd}
                </button>
                {image && (
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImageKB(null); }}
                    className="h-10 px-3 rounded-lg bg-danger/10 text-[14px] font-medium text-danger hover:bg-danger/20 transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    {COPY.growth.imageRemove}
                  </button>
                )}
              </div>
              <p className={`text-[13px] mt-1 ${imageErr ? "text-danger" : "text-ink-muted"}`}>
                {compressing
                  ? COPY.growth.imageCompressing
                  : imageErr
                    ? COPY.growth[imageErr]
                    : image && imageKB
                      ? COPY.growth.imageRetained(imageKB)
                      : COPY.growth.imageHelper}
              </p>
            </div>
          </div>
        </div>

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
