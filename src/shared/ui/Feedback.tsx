import type { ReactNode } from "react";
import { CircleCheck, Star, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";
import { useToastStore } from "../stores/toastStore";

export function Badge({ tone, children, className }: { tone: string; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tone,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Alert({ kind = "error", children }: { kind?: "error" | "info" | "success"; children: ReactNode }) {
  const tone = {
    error: "border-rose-200 bg-rose-50 text-rose-800",
    info: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-pine-200 bg-pine-50 text-pine-800",
  }[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={cn("flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm", tone)}>
      {kind === "success" ? (
        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      )}
      <div>{children}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} aria-hidden />;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  text?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-sand-300 bg-white/60 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      {text && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** A read-only rating, or a picker when onChange is given. */
export function Stars({ value, onChange, size = "sm" }: { value: number; onChange?: (value: number) => void; size?: "sm" | "lg" }) {
  const dimension = size === "lg" ? "h-8 w-8" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5" role={onChange ? "radiogroup" : "img"} aria-label={`${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const icon = (
          <Star className={cn(dimension, star <= Math.round(value) ? "fill-saffron-400 text-saffron-400" : "fill-sand-200 text-sand-200")} />
        );
        return onChange ? (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} sur 5`}
            onClick={() => onChange(star)}
            className="rounded transition hover:scale-110"
          >
            {icon}
          </button>
        ) : (
          <span key={star}>{icon}</span>
        );
      })}
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex max-w-md animate-rise items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lift",
            toast.kind === "success" ? "bg-pine-800" : "bg-rose-700",
          )}
        >
          {toast.kind === "success" ? <CircleCheck className="h-4 w-4 shrink-0" /> : <TriangleAlert className="h-4 w-4 shrink-0" />}
          <span>{toast.text}</span>
          <button onClick={() => dismiss(toast.id)} aria-label="Fermer" className="rounded-full p-1 hover:bg-white/15">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
