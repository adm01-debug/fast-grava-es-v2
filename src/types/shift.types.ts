export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  operators: string[];
}

export interface Handover {
  id: string;
  fromShift: string;
  toShift: string;
  notes: string;
  pendingTasks: string[];
  createdAt: string;
}
