export type LabourByDate = {
  date: string;
  total: number;
  labour_by_time_period: Record<string, number>;
};

export type EmployeeLabour = {
  employee_id: number;
  first_name: string;
  last_name: string | null;
  labour: LabourByDate[];
};

export type PeriodTotals = {
  period1: number;
  period2: number;
  period3: number;
  period4: number;
};

export type EmployeeCard = {
  id: number;
  name: string;
  totalHours: number;
  periodTotals: PeriodTotals;
};

export type EmployeeCardHandlers = {
  open: boolean;
  onToggle: () => void;
};

