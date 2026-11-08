import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { COPY } from "../lib/copy";

type Variant = "success" | "info" | "error";

interface ToastItem {
  id: number;
  message: string;
  variant: Variant;
  sticky: boolean;
}

interface ToastCtx {
  toast: (message: string, variant?: Variant) => void;
}

const ToastContext = createContext<ToastCtx>({ toast: () => undefined });

export function useToast(): ToastCtx {
  return useContext(ToastContext);
}

// Design.md 3.3 — top-anchored, full-width minus 16px, 3s auto-dismiss (4s error),
// sticky "offline" toast until the online event.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  let nextId = 1;

  const dismiss = useCallback((id: number) => {
    setItems((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: Variant = "info") => {
      const sticky = message === COPY.growth.toastOffline;
      const id = nextId++;
      setItems((cur) => [...cur.slice(-2), { id, message, variant, sticky }]);
      if (!sticky) {
        window.setTimeout(() => dismiss(id), variant === "error" ? 4000 : 3000);
      }
    },
    [dismiss]
  );

  useEffect(() => {
    const onOnline = () => setItems((cur) => cur.filter((t) => !t.sticky));
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-2 inset-x-2 z-[100] flex flex-col gap-2 sm:left-auto sm:w-96"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={`bg-surface border rounded-lg shadow-elev px-4 py-3 text-sm flex items-start gap-2 ${
              t.variant === "error" ? "border-danger" : t.variant === "success" ? "border-success" : "border-line"
            }`}
          >
            {t.variant === "success" && <CheckCircle2 aria-hidden size={20} className="text-success shrink-0" />}
            {t.variant === "info" && <Info aria-hidden size={20} className="text-ink-muted shrink-0" />}
            {t.variant === "error" && <XCircle aria-hidden size={20} className="text-danger shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
