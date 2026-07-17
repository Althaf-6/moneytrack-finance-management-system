"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Tags,
  Wallet,
  Target,
  PieChart,
  Menu,
  X,
  LogOut,
  CircleDollarSign,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { cx } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/income", label: "Income", icon: TrendingUp },
  { href: "/expenses", label: "Expenses", icon: TrendingDown },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/reports", label: "Reports", icon: PieChart },
];

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400 text-emerald-950 shadow-[0_0_24px_rgba(52,211,153,0.35)]">
        <CircleDollarSign className="h-5 w-5" strokeWidth={2.4} />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-white">
        Money<span className="text-emerald-400">Track</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cx(
              "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-emerald-400/10 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.18)]"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-white",
            )}
          >
            <item.icon
              className={cx(
                "h-[18px] w-[18px] transition-colors",
                active
                  ? "text-emerald-400"
                  : "text-zinc-500 group-hover:text-zinc-300",
              )}
              strokeWidth={active ? 2.2 : 1.8}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserCard({
  user,
}: {
  user: { name: string; email: string };
}) {
  return (
    <div className="rounded-2xl border border-line bg-white/[0.02] p-3">
      <Link href="/profile" className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 font-display text-sm font-bold text-emerald-950">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-zinc-100">
            {user.name}
          </span>
          <span className="block truncate text-xs text-zinc-500">
            {user.email}
          </span>
        </span>
      </Link>
      <form action={logoutAction} className="mt-2">
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-rose-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </form>
    </div>
  );
}

export default function AppShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[420px] bg-[radial-gradient(600px_300px_at_20%_-40px,rgba(16,185,129,0.13),transparent)]"
      />

      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-line bg-[#0c0c0f]/90 px-4 py-6 backdrop-blur lg:flex">
        <div className="px-2">
          <Brand />
        </div>
        <div className="mt-9 flex-1">
          <NavLinks />
        </div>
        <UserCard user={user} />
      </aside>

      {/* mobile topbar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-[#0c0c0f]/85 px-4 backdrop-blur lg:hidden">
        <Brand />
        <button
          className="icon-btn border border-line"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="animate-modal absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-line bg-[#0c0c0f] px-4 py-6">
            <div className="flex items-center justify-between px-2">
              <Brand />
              <button
                className="icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8 flex-1">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <UserCard user={user} />
          </div>
        </div>
      )}

      {/* content */}
      <main className="relative z-10 lg:pl-[264px]">
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:px-10 lg:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}
