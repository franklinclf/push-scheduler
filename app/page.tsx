'use client';

import { useEffect, useMemo, useState } from "react";
import labourHours from "../data/labour_hours.json";
import { EmployeeCard, EmployeeCardHandlers, EmployeeLabour, PeriodTotals } from "./types";
import { EmployeeCardItem } from "./components/employee-card";

const PERIOD_LABELS: Record<keyof PeriodTotals, string> = {
  period1: "Morning (5-12)",
  period2: "Afternoon (12-18)",
  period3: "Evening (18-23)",
  period4: "Late Night (23-5)",
};

const employees: EmployeeCard[] = (labourHours as EmployeeLabour[]).map((employee) => {
  const totalHours = employee.labour.reduce((sum, day) => sum + day.total, 0);
  const periodTotals = employee.labour.reduce<PeriodTotals>(
    (acc, day) => {
      acc.period1 += day.labour_by_time_period.period1;
      acc.period2 += day.labour_by_time_period.period2;
      acc.period3 += day.labour_by_time_period.period3;
      acc.period4 += day.labour_by_time_period.period4;
      return acc;
    },
    { period1: 0, period2: 0, period3: 0, period4: 0 },
  );

  const name = [employee.first_name, employee.last_name || ""].join(" ").trim();

  return { id: employee.employee_id, name, totalHours, periodTotals };
});

export default function Home() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeModalId, setActiveModalId] = useState<number | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(handle);
  }, [query]);

  const filtered = useMemo(() => {
    const value = debouncedQuery.trim().toLowerCase();
    if (!value) return employees;
    return employees.filter((employee) => employee.name.toLowerCase().includes(value));
  }, [debouncedQuery]);

  const activeEmployee = useMemo(
    () => employees.find((employee) => employee.id === activeModalId) ?? null,
    [activeModalId],
  );

  useEffect(() => {
    if (!activeEmployee) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveModalId(null);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeEmployee]);

  return (
    <div>
      <div className="mb-6 w-full xl:max-w-[50%]">
        <label htmlFor="employee-filter" className="sr-only">
          Filter employees by name
        </label>
        <input
          id="employee-filter"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveModalId(null);
          }}
          placeholder="Filter employees by name"
          className="w-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-[0_1px_2px_rgba(16,45,73,0.05)] focus:border-[#4db3d3] focus:outline-none"
          type="search"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-start justify-center pt-1.5 text-xl font-bold text-[#103b73]">
          No employees match!
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((employee) => (
            <EmployeeCardItem
              key={employee.id}
              employee={employee}
              {...({
                open: activeModalId === employee.id,
                onToggle: () =>
                  setActiveModalId((current) =>
                    current === employee.id ? null : employee.id,
                  ),
              } satisfies EmployeeCardHandlers)}
            />
          ))}
        </div>
      )}

      {activeEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            event.preventDefault();
            setActiveModalId(null);
          }}
        >
          <div
            className="w-full max-w-md border border-slate-200 bg-white p-6 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="period-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div id="period-modal-title" className="text-lg font-semibold text-[#103b73]">
                  {activeEmployee.name}
                </div>
                <div className="text-sm text-slate-600">Period breakdown</div>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-[#103b73] underline underline-offset-4"
                onClick={() => setActiveModalId(null)}
              >
                Close
              </button>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              {(Object.entries(activeEmployee.periodTotals) as Array<
                [keyof PeriodTotals, number]
              >).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span>{PERIOD_LABELS[key]}</span>
                  <span className="font-semibold text-[#103b73]">{value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
