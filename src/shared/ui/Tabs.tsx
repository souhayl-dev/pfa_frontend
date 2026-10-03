import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";

interface TabsProps<K extends string> {
  tabs: { key: K; label: string; icon?: LucideIcon; count?: number }[];
  value: K;
  onChange: (key: K) => void;
}

export function Tabs<K extends string>({ tabs, value, onChange }: TabsProps<K>) {
  return (
    <div className="scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="inline-flex gap-1 rounded-2xl bg-sand-100 p-1" role="tablist">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            role="tab"
            aria-selected={value === key}
            onClick={() => onChange(key)}
            className={cn(
              "flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold whitespace-nowrap transition",
              value === key ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-900",
            )}
          >
            {Icon && <Icon className="h-4 w-4" aria-hidden />}
            {label}
            {count !== undefined && <span className="rounded-full bg-sand-200 px-1.5 text-xs">{count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
