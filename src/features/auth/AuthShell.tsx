import type { ReactNode } from "react";
import { CalendarCheck, ShieldCheck, Sparkles } from "lucide-react";

const PERKS = [
  { icon: Sparkles, text: "Hôtels, tables, guides, circuits et voitures au même endroit" },
  { icon: CalendarCheck, text: "Prix et disponibilité affichés avant de réserver" },
  { icon: ShieldCheck, text: "Des prestataires vérifiés par notre équipe" },
];

/** The two-panel frame shared by every account page. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
      <div className="relative isolate hidden overflow-hidden rounded-[2rem] bg-pine-950 p-10 text-white lg:flex lg:flex-col lg:justify-end">
        <div className="absolute -top-20 -right-16 -z-10 h-72 w-72 animate-drift rounded-full bg-brand-500/50 blur-[90px]" />
        <div className="absolute -bottom-24 -left-10 -z-10 h-72 w-72 rounded-full bg-saffron-400/25 blur-[90px]" />
        <div className="zellige absolute inset-0 -z-10 opacity-[0.07]" />
        <h2 className="font-display text-4xl leading-tight font-semibold">
          Le voyage commence <span className="text-saffron-300 italic">ici.</span>
        </h2>
        <ul className="mt-8 space-y-4">
          {PERKS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-pine-100">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon className="h-4 w-4 text-saffron-300" aria-hidden />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
      <div className="animate-rise rounded-[2rem] border border-sand-200 bg-white p-6 shadow-card sm:p-10">
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
