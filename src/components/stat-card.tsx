import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cx } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex animate-fade-up flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm text-zinc-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

const TONES = {
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  white: "border-white/10 bg-white/[0.06] text-zinc-100",
  zinc: "border-white/10 bg-white/[0.04] text-zinc-400",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-300",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "emerald",
  index = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: ReactNode;
  tone?: keyof typeof TONES;
  index?: number;
}) {
  return (
    <div
      className="card group relative overflow-hidden p-5 animate-fade-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-500/[0.07] blur-2xl transition-opacity duration-500 group-hover:opacity-150"
      />
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
          {label}
        </p>
        <span
          className={cx(
            "grid h-9 w-9 place-items-center rounded-xl border",
            TONES[tone],
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
        </span>
      </div>
      <p className="mt-3 font-display text-[26px] leading-none font-bold tracking-tight text-white">
        {value}
      </p>
      {sub ? <div className="mt-2.5 text-xs text-zinc-500">{sub}</div> : null}
    </div>
  );
}

export function Card({
  title,
  subtitle,
  actions,
  children,
  className,
  index = 0,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <section
      className={cx("card animate-fade-up overflow-hidden", className)}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-white">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
            ) : null}
          </div>
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  );
}
