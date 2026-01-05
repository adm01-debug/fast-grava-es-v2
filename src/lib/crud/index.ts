// CRUD Toolkit - Índice de Exports
// Simplified version with only existing dependencies

// Hooks
export { useCRUD } from '@/hooks/useCRUD';
export { useSavedFilters } from '@/hooks/useSavedFilters';
export { useFulltextSearch } from '@/hooks/useFulltextSearch';
export { useDuplicate } from '@/hooks/useDuplicate';
export { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
export { useBulkActions } from '@/hooks/useBulkActions';

// Components
export { DataImporter } from '@/components/DataImporter';
export { SavedFiltersDropdown } from '@/components/SavedFiltersDropdown';
export { AdvancedFilters } from '@/components/AdvancedFilters';
export { BulkActionsBar } from '@/components/BulkActionsBar';
export { DuplicateButton } from '@/components/DuplicateButton';

// Types
export type { FilterConfig } from '@/components/AdvancedFilters';
