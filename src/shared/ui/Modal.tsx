import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../lib/cn";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** "sheet" slides in from the right on large screens; both sit at the bottom on phones. */
  variant?: "dialog" | "sheet";
  wide?: boolean;
}

export function Modal({ title, onClose, children, variant = "dialog", wide }: ModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Rendered on <body>: an animated or clipped ancestor would otherwise trap the fixed overlay.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative flex max-h-[92dvh] w-full animate-rise flex-col bg-white shadow-lift",
          variant === "sheet"
            ? "rounded-t-3xl sm:absolute sm:inset-y-0 sm:right-0 sm:max-h-none sm:w-[26rem] sm:rounded-none sm:rounded-l-3xl"
            : cn("rounded-t-3xl sm:rounded-3xl", wide ? "sm:max-w-2xl" : "sm:max-w-md"),
        )}
      >
        <header className="flex items-center justify-between gap-4 border-b border-sand-200 px-5 py-4">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Fermer" className="rounded-full p-2 text-ink-500 hover:bg-sand-100 hover:text-ink-900">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
