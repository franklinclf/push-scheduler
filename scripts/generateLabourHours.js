import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const SOURCE_PATH = path.join(process.cwd(), "./", "data", "apertureLabsClocks.json");
const OUTPUT_DIR = path.join(process.cwd(), "data");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "labour_hours.json");

const PERIOD_KEYS = ["period1", "period2", "period3", "period4"];

function parseDate(value) {
  return new Date(`${value.replace(" ", "T")}Z`);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getPeriodKey(date) {
  const hour = date.getUTCHours();
  if (hour >= 5 && hour < 12) return "period1";
  if (hour >= 12 && hour < 18) return "period2";
  if (hour >= 18 && hour < 23) return "period3";
  return "period4";
}

function getPeriodBoundary(date) {
  const base = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0,
    0,
    0,
  );
  const hour = date.getUTCHours();

  if (hour < 5) return new Date(base + 5 * 60 * 60 * 1000);
  if (hour < 12) return new Date(base + 12 * 60 * 60 * 1000);
  if (hour < 18) return new Date(base + 18 * 60 * 60 * 1000);
  if (hour < 23) return new Date(base + 23 * 60 * 60 * 1000);
  return new Date(base + 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000);
}

function getMidnightBoundary(date) {
  const base = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0,
    0,
    0,
  );
  return new Date(base + 24 * 60 * 60 * 1000);
}

function roundHours(value) {
  return Number(value.toFixed(2));
}

function ensureEmployeeMap(employees) {
  const map = new Map();
  for (const employee of employees) {
    map.set(employee.id, {
      employee_id: employee.id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      labour: new Map(),
    });
  }
  return map;
}

function accumulateHours({ employees, clocks }) {
  const employeeMap = ensureEmployeeMap(employees);

  for (const clock of clocks) {
    const employee = employeeMap.get(clock.employee_id);
    if (!employee) continue;

    let start = parseDate(clock.clock_in_datetime);
    const end = parseDate(clock.clock_out_datetime);

    if (!(end > start)) {
      throw new Error(`Invalid shift for employee ${clock.employee_id}: end before start`);
    }

    while (start < end) {
      const periodKey = getPeriodKey(start);
      const periodBoundary = getPeriodBoundary(start);
      const midnight = getMidnightBoundary(start);
      const segmentEnd = new Date(
        Math.min(end.getTime(), periodBoundary.getTime(), midnight.getTime()),
      );

      const hours = (segmentEnd.getTime() - start.getTime()) / (1000 * 60 * 60);
      const dateKey = formatDate(start);

      if (!employee.labour.has(dateKey)) {
        employee.labour.set(dateKey, {
          date: dateKey,
          total: 0,
          labour_by_time_period: {
            period1: 0,
            period2: 0,
            period3: 0,
            period4: 0,
          },
        });
      }

      const labourEntry = employee.labour.get(dateKey);
      labourEntry.total += hours;
      labourEntry.labour_by_time_period[periodKey] += hours;

      start = segmentEnd;
    }
  }

  return employeeMap;
}

function serialize(employeeMap) {
  return Array.from(employeeMap.values()).map((employee) => {
    const labour = Array.from(employee.labour.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((entry) => ({
        date: entry.date,
        total: roundHours(entry.total),
        labour_by_time_period: Object.fromEntries(
          PERIOD_KEYS.map((key) => [key, roundHours(entry.labour_by_time_period[key])]),
        ),
      }));

    return {
      employee_id: employee.employee_id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      labour,
    };
  });
}

function main() {
  const raw = JSON.parse(readFileSync(SOURCE_PATH, "utf8"));
  const employeeMap = accumulateHours(raw);
  const output = serialize(employeeMap);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main();
