import Link from "next/link";
import type { ReactNode } from "react";
import { CircleDollarSign, TrendingUp, Quote } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-ink lg:grid-cols-2">
      {/* brand panel */}
      <div className="noise relative hidden flex-col justify-between overflow-hidden border-r border-line bg-[#0c0c0f] p-12 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(640px_360px_at_20%_-60px,rgba(16,185,129,0.18),transparent)]"
        />
        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400 text-emerald-950">
            <CircleDollarSign className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg font-bold text-white">
            Money<span className="text-emerald-400">Track</span>
          </span>
        </Link>

        <div className="relative">
          <Quote className="h-8 w-8 text-emerald-400/60" />
          <p className="mt-6 max-w-md font-display text-3xl leading-snug font-semibold text-white">
            “Do not save what is left after spending — spend what is left after
            saving.”
          </p>
          <p className="mt-5 text-sm font-medium text-zinc-500">
            Warren Buffett
          </p>

          <div className="mt-10 flex items-center gap-3 rounded-2xl border border-line bg-white/[0.02] p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-200">
                Join thousands tracking smarter
              </p>
              <p className="text-xs text-zinc-500">
                Income · Expenses · Budgets · Goals · Reports
              </p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-zinc-600">
          © {new Date().getFullYear()} MoneyTrack. Your data stays yours.
        </p>
      </div>

      {/* form panel */}
      <div className="relative flex items-center justify-center px-4 py-16 sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(480px_220px_at_50%_-80px,rgba(16,185,129,0.12),transparent)] lg:hidden"
        />
        <div className="relative w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
