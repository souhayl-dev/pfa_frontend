import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

const CONTROL =
  "w-full rounded-xl border border-sand-300 bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition " +
  "hover:border-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none disabled:bg-sand-100 disabled:text-ink-500";

interface LabelProps {
  label: string;
  hint?: string;
  className?: string;
}

function Wrapper({ id, label, hint, className, children }: LabelProps & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink-700">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export function Input({ label, hint, className, ...rest }: LabelProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} className={className}>
      <input id={id} className={cn(CONTROL, "h-11")} {...rest} />
    </Wrapper>
  );
}

export function Textarea({ label, hint, className, ...rest }: LabelProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} className={className}>
      <textarea id={id} rows={3} className={cn(CONTROL, "py-2.5")} {...rest} />
    </Wrapper>
  );
}

interface SelectProps extends LabelProps, SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, hint, className, options, placeholder, ...rest }: SelectProps) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} className={className}>
      <select id={id} className={cn(CONTROL, "h-11 pr-8")} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

export function Checkbox({ label, ...rest }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink-700">
      <input type="checkbox" className="h-4.5 w-4.5 rounded accent-brand-600" {...rest} />
      {label}
    </label>
  );
}
