// Main ShiftHandover hook - combines queries and mutations
// Refactored to re-export from sub-modules for maintainability

import { useShiftHandoverQueries } from './shift-handover/useShiftHandoverQueries';
import { useShiftHandoverMutations as useShiftHandoverMutationsImpl } from './shift-handover/useShiftHandoverMutations';

// Re-export types
export type {
  ShiftHandover,
  ShiftChecklistItem,
  ShiftPendingTask,
  ShiftOccurrence,
  ChecklistTemplate,
} from './shift-handover/shiftHandoverTypes';

// Re-export query hooks
export {
  useShiftHandovers,
  useShiftHandover,
  useShiftChecklist,
  useShiftPendingTasks,
  useShiftOccurrences,
  useChecklistTemplates,
} from './shift-handover/useShiftHandoverQueries';

// Re-export mutations
export { useShiftHandoverMutations } from './shift-handover/useShiftHandoverMutations';

// Re-export utilities
export { SHIFT_TYPE_LABELS, getCurrentShiftType } from './shift-handover/shiftHandoverTypes';
