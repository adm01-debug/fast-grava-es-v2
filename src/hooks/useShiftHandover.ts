// Main ShiftHandover hook - re-exports from sub-modules for maintainability

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
