import type * as React from "react";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "warm" | "blue" | "green";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-stone-100 text-stone-700 border-stone-200",
  warm: "bg-amber-50 text-amber-800 border-amber-100",
  blue: "bg-sky-50 text-sky-800 border-sky-100",
  green: "bg-emerald-50 text-emerald-800 border-emerald-100"
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
