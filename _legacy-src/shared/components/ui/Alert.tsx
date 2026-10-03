import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/cn";

export function Alert({ variant, children }: { variant: "error" | "success"; children: ReactNode }) {
  const isError = variant === "error";
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm",
        isError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700",
      )}
    >
      {isError ? <AlertCircle className="size-4 mt-0.5 shrink-0" /> : <CheckCircle2 className="size-4 mt-0.5 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}
