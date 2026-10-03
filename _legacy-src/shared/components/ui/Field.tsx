import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const inputBase =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-sm font-medium text-neutral-800 mb-1.5">{children}</label>;
}

export function Field({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      {children}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputBase, "resize-none", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputBase, "appearance-none bg-no-repeat pr-9", props.className)} />;
}
