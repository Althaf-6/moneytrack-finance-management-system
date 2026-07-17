import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  PieChart,
  Tags,
  ShieldCheck,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Income tracking",
    desc: "Log every salary, freelance payment and investment return in seconds.",
  },
  {
    icon: TrendingDown,
    title: "Expense control",
    desc: "Capture daily spending and search your full history instantly.",
  },
  {
    icon: Tags,
    title: "Smart categories",
    desc: "Organize money your way with custom income and expense categories.",
  },
  {
    icon: Wallet,
    title: "Monthly budgets",
    desc: "Set spending limits and watch your pace with live progress tracking.",
  },
  {
    icon: Target,
    title: "Savings goals",
    desc: "Turn dreams into targets — fund them and track progress to 100%.",
  },
  {
    icon: PieChart,
    title: "Reports & analytics",
    desc: "Beautiful charts reveal where money comes from and where it goes.",
  },
];

const MARQUEE = [
  "Track income",
  "Control expenses",
  "Set budgets",
  "Grow savings",
  "Visual reports",
  "Secure accounts",
];

const MOCK_BARS = [42, 68, 35, 80, 56, 92];

function HeroMock() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
      <div
        aria-hidden
        className="absolute -inset-8 rounded-[40px] bg-[radial-gradient(320px_220px_at_60%_10%,rgba(16,185,129,0.22),transparent)] blur-2xl"
      />
      <div className="card relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
        <div className="border-b border-line px-6 py-4">
          <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
            Total balance
          </p>
          <div className="mt-1 flex items-end justify-between">
            <p className="font-display text-3xl font-bold text-white">
              LKR 250,000
            </p>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              <ArrowUpRight className="h-3 w-3" /> +18.2%
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 px-6 pt-6">
          {MOCK_BARS.map((h, i) => (
            <div key={i} className="flex w-full flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end rounded-md bg-white/[0.03]">
                <div
                  className="w-full rounded-md bg-gradient-to-t from-emerald-600/60 to-emerald-400"
                  style={{ height: `${h}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-600">
                {["Feb", "Mar", "Apr", "May", "Jun", "Jul"][i]}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 border-t border-line px-6 py-5">
          {[
            {
              name: "Monthly salary",
              meta: "Salary · 01 Jul",
              amount: "+ LKR 150,000",
              icon: ArrowDownLeft,
              tone: "text-emerald-300",
              chip: "bg-emerald-400/10 text-emerald-300",
            },
            {
              name: "Groceries run",
              meta: "Food · 03 Jul",
              amount: "- LKR 5,000",
              icon: ArrowUpRight,
              tone: "text-zinc-300",
              chip: "bg-white/[0.05] text-zinc-400",
            },
          ].map((tx) => (
            <div
              key={tx.name}
              className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-2.5"
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg ${tx.chip}`}
              >
                <tx.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-zinc-200">
                  {tx.name}
                </span>
                <span className="block text-xs text-zinc-500">{tx.meta}</span>
              </span>
              <span className={`font-display text-sm font-semibold ${tx.tone}`}>
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card absolute -left-6 -bottom-6 hidden w-44 animate-fade-up p-4 sm:block">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300">
            <Target className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] tracking-wider text-zinc-500 uppercase">
              Goal · Laptop
            </p>
            <p className="font-display text-sm font-bold text-white">40%</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-[40%] rounded-full bg-emerald-400" />
        </div>
      </div>
    </div>
  );
}

export default async function LandingPage() {
  const user = await getSessionUser();

  return (
    <div className="noise min-h-screen overflow-x-clip bg-ink">
      {/* ambient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(900px_420px_at_50%_-140px,rgba(16,185,129,0.16),transparent)]"
      />

      {/* nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.04] bg-ink/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-400 text-emerald-950">
              <CircleDollarSign className="h-[18px] w-[18px]" strokeWidth={2.4} />
            </span>
            <span className="font-display text-base font-bold tracking-tight text-white">
              Money<span className="text-emerald-400">Track</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <Link href="/dashboard" className="btn-primary">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-ghost hidden sm:inline-flex !py-2"
                >
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary !py-2">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-36 pb-24 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:pt-44">
        <div>
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3.5 py-1.5 text-xs font-medium text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Personal finance, beautifully organized
          </span>
          <h1 className="mt-6 animate-fade-up font-display text-5xl leading-[1.04] font-bold tracking-tight text-white [animation-delay:80ms] sm:text-6xl">
            Every rupee,{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
              accounted for.
            </span>
          </h1>
          <p className="mt-6 max-w-md animate-fade-up text-lg leading-relaxed text-zinc-400 [animation-delay:160ms]">
            MoneyTrack brings your income, expenses, budgets and savings goals
            into one calm, premium dashboard — built for students, freelancers
            and small business owners.
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:240ms]">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="btn-primary px-6 py-3 text-[15px]"
            >
              Start tracking free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-ghost px-6 py-3 text-[15px]">
              I already have an account
            </Link>
          </div>
          <p className="mt-6 animate-fade-up text-xs text-zinc-600 [animation-delay:320ms]">
            Free forever · Encrypted passwords · No credit card required
          </p>
        </div>
        <div className="animate-fade-up [animation-delay:200ms]">
          <HeroMock />
        </div>
      </section>

      {/* marquee */}
      <div className="relative border-y border-white/[0.05] bg-white/[0.015] py-5">
        <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-8 font-display text-sm font-semibold tracking-[0.2em] text-zinc-500 uppercase"
            >
              {item}
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
            </span>
          ))}
        </div>
      </div>

      {/* features */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <p className="font-display text-sm font-semibold tracking-[0.2em] text-emerald-400 uppercase">
            Everything you need
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-white">
            One dashboard for your entire financial life
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="card group p-6 transition-colors duration-300 hover:border-emerald-400/25"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300 transition-transform duration-300 group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* stats */}
      <section className="border-y border-white/[0.05] bg-panel/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-4">
          {[
            ["LKR", "Native currency view"],
            ["11", "Starter categories"],
            ["6+", "Live analytics charts"],
            ["100%", "Private & secure"],
          ].map(([num, label]) => (
            <div key={label} className="px-6 py-10 text-center">
              <p className="font-display text-4xl font-bold text-white">{num}</p>
              <p className="mt-1.5 text-xs tracking-wide text-zinc-500 uppercase">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="mx-auto max-w-6xl px-4 py-28 text-center sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none mx-auto -mb-24 h-56 w-[560px] max-w-full rounded-full bg-emerald-500/15 blur-[100px]"
        />
        <h2 className="relative font-display text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl">
          Your money deserves
          <br />
          <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
            better than a spreadsheet.
          </span>
        </h2>
        <p className="relative mx-auto mt-5 max-w-md text-zinc-400">
          Create your free account in under a minute and see your finances with
          total clarity.
        </p>
        <Link
          href={user ? "/dashboard" : "/register"}
          className="btn-primary relative mt-9 px-8 py-3.5 text-[15px]"
        >
          {user ? "Open dashboard" : "Create free account"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* footer */}
      <footer className="border-t border-white/[0.05] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-zinc-600 sm:flex-row sm:px-6">
          <p className="flex items-center gap-2">
            <CircleDollarSign className="h-3.5 w-3.5 text-emerald-500" />
            MoneyTrack — Personal Finance Management
          </p>
          <p>Built with Next.js, PostgreSQL & Drizzle ORM</p>
        </div>
      </footer>
    </div>
  );
}
