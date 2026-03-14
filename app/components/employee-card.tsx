"use client";

import { EmployeeCard, EmployeeCardHandlers } from "../types";

type Props = {
  employee: EmployeeCard;
} & EmployeeCardHandlers;

export function EmployeeCardItem({ employee, open, onToggle }: Props) {
  return (
    <div className="border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-px hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="text-lg font-semibold text-[#103b73]">{employee.name}</div>
        <button
          type="button"
          onClick={onToggle}
          className="text-xs font-semibold uppercase tracking-wide text-[#103b73] underline underline-offset-4"
        >
          {open ? "Hide periods" : "Show periods"}
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-semibold text-[#103b73]">Total hours</span>
        <span className="text-slate-700">{employee.totalHours.toFixed(1)}</span>
      </div>
    </div>
  );
}

