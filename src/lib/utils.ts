export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ---------------- currency (LKR) ---------------- */

export function formatLKR(amount: number) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `LKR ${formatted}`;
}

export function formatCompact(amount: number) {
  if (amount >= 1_000_000) return `${trimZero(amount / 1_000_000)}M`;
  if (amount >= 1_000) return `${trimZero(amount / 1_000)}K`;
  return `${amount}`;
}

function trimZero(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/* ---------------- dates / months ---------------- */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return month;
  return `${MONTHS[m - 1]} ${y}`;
}

export function shortMonthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return month;
  return `${MONTHS[m - 1].slice(0, 3)} ${String(y).slice(2)}`;
}

/** Last `n` months including the current one, ascending: ["2026-02", ...] */
export function lastMonths(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(
      `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return out;
}

export function isValidMonth(value: string | undefined | null): value is string {
  return !!value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
