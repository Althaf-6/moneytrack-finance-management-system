"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthPicker({
  value,
  basePath,
}: {
  value: string;
  basePath: string;
}) {
  const router = useRouter();
  const go = (m: string) => router.push(`${basePath}?month=${m}`);

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => go(shiftMonth(value, -1))}
        className="icon-btn border border-line"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <input
        type="month"
        value={value}
        onChange={(e) => e.target.value && go(e.target.value)}
        className="field-input !w-[160px] !py-2 text-center font-medium"
      />
      <button
        onClick={() => go(shiftMonth(value, 1))}
        className="icon-btn border border-line"
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
