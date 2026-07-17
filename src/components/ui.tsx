"use client";

import { useEffect, type ReactNode } from "react";
import { X, Loader2, Inbox } from "lucide-react";
import { cx } from "@/lib/utils";

/* ---------------- Modal ---------------- */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        className={cx(
          "card relative z-10 w-full animate-modal overflow-hidden",
          wide ? "max-w-2xl" : "max-w-lg",
        )}
      >
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
            ) : null}
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Spinner ---------------- */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cx("h-4 w-4 animate-spin", className)} />;
}

/* ---------------- Empty state ---------------- */

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-white/[0.03] text-zinc-500">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <p className="font-display text-base font-semibold text-zinc-200">
        {title}
      </p>
      {hint ? <p className="max-w-sm text-sm text-zinc-500">{hint}</p> : null}
      {action}
    </div>
  );
}

/* ---------------- Type badge ---------------- */

export function TypeBadge({ type }: { type: "INCOME" | "EXPENSE" }) {
  const income = type === "INCOME";
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase",
        income
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-zinc-500/25 bg-white/[0.04] text-zinc-300",
      )}
    >
      <span
        className={cx(
          "h-1.5 w-1.5 rounded-full",
          income ? "bg-emerald-400" : "bg-zinc-400",
        )}
      />
      {income ? "Income" : "Expense"}
    </span>
  );
}

/* ---------------- Progress bar ---------------- */

export function ProgressBar({
  value,
  tone = "auto",
  className,
}: {
  value: number; // 0..100
  tone?: "auto" | "emerald" | "amber" | "rose";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const resolved =
    tone !== "auto"
      ? tone
      : pct >= 100
        ? "rose"
        : pct >= 75
          ? "amber"
          : "emerald";
  const color =
    resolved === "emerald"
      ? "bg-emerald-400"
      : resolved === "amber"
        ? "bg-amber-400"
        : "bg-rose-400";
  return (
    <div
      className={cx(
        "h-2 w-full overflow-hidden rounded-full bg-white/[0.06]",
        className,
      )}
    >
      <div
        className={cx(
          "h-full rounded-full transition-all duration-700",
          color,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
