import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, LayoutList, ShieldCheck, Users } from "lucide-react";
import { cn } from "../../shared/lib/cn";

const LINKS = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Utilisateurs", icon: Users, end: false },
  { to: "/admin/listings", label: "Annonces", icon: LayoutList, end: false },
];

export function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr] lg:gap-10">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="mb-4 hidden items-center gap-2 px-3 lg:flex">
          <span className="flex size-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <ShieldCheck className="size-4" />
          </span>
          <span className="text-sm font-semibold text-neutral-900">Console admin</span>
        </div>
        <nav className="scrollbar-none flex gap-1 overflow-x-auto rounded-2xl bg-neutral-100 p-1 lg:flex-col lg:bg-transparent lg:p-0">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white text-neutral-900 shadow-sm lg:bg-neutral-900 lg:text-white lg:shadow-none"
                    : "text-neutral-600 hover:text-neutral-900 lg:hover:bg-neutral-100",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
          </div>
          {actions}
        </header>
        {children}
      </div>
    </div>
  );
}

export function Panel({ title, action, flush, className, children }: { title?: string; action?: ReactNode; flush?: boolean; className?: string; children: ReactNode }) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]", !flush && "p-5", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; count?: number; icon?: typeof Users }[];
}) {
  return (
    <div className="scrollbar-none inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-neutral-100 p-1">
      {options.map(({ value: optionValue, label, count, icon: Icon }) => {
        const active = optionValue === value;
        return (
          <button
            key={optionValue}
            onClick={() => onChange(optionValue)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
              active ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900",
            )}
          >
            {Icon && <Icon className="size-4" />}
            {label}
            {count !== undefined && (
              <span className={cn("rounded-md px-1.5 text-xs tabular-nums", active ? "bg-neutral-100 text-neutral-700" : "text-neutral-400")}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Initials({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700", className)}>
      {initials || "?"}
    </span>
  );
}
