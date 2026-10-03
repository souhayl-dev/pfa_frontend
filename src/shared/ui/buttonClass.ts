import { cn } from "../lib/cn";

export type Variant = "primary" | "dark" | "outline" | "ghost" | "danger";
export type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-glow hover:from-brand-400 hover:to-brand-600 active:to-brand-700",
  dark: "bg-ink-900 text-white hover:bg-ink-700",
  outline: "border border-sand-300 bg-white text-ink-800 hover:border-ink-400 hover:bg-sand-50",
  ghost: "text-ink-700 hover:bg-sand-100",
  danger: "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text-sm",
  md: "h-11 gap-2 rounded-xl px-4 text-sm",
  lg: "h-13 gap-2 rounded-2xl px-6 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition duration-150",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none active:scale-[0.98]",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}
