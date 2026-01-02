# 📚 Documentação CRUD - Fast Grava ES

## Visão Geral

Sistema completo de melhorias CRUD enterprise-grade com 18 funcionalidades.

## Hooks Disponíveis

### useSavedFilters
```typescript
const { filters, saveFilter, deleteFilter, setAsDefault } = useSavedFilters('jobs');
```

### useFulltextSearch
```typescript
const { data, isLoading } = useFulltextSearch('termo', { table: 'jobs', searchColumns: ['name'] });
```

### useVersions
```typescript
const { versions, latestVersion, versionCount } = useVersions('jobs', entityId);
```

### useBulkActions
```typescript
const { selectedIds, toggleSelection, bulkDelete, bulkArchive } = useBulkActions({ tableName: 'jobs', queryKey: ['jobs'] });
```

### useInfiniteScroll
```typescript
const { data, loadMoreRef, hasNextPage } = useInfiniteScroll(['jobs'], { tableName: 'jobs' });
```

### useDuplicate
```typescript
const { duplicate, bulkDuplicate, isDuplicating } = useDuplicate({ tableName: 'jobs', queryKey: ['jobs'] });
```

## Componentes

| Componente | Uso |
|------------|-----|
| SavedFiltersDropdown | Gerenciar filtros salvos |
| DataImporter | Import CSV/Excel |
| FulltextSearchInput | Busca com debounce |
| VersionHistory | Histórico de versões |
| BulkActionsBar | Ações em massa |
| ExportMenu | Export CSV/Excel/PDF |
| InfiniteScrollList | Lista com scroll infinito |

## Libs

| Lib | Funções |
|-----|---------|
| csvImporter | importCSV, generateCSVTemplate |
| excelImporter | importExcel, getExcelSheets |
| dataExporter | exportToCSV, exportToExcel, exportToPDF |

## Migrations

- `20241223000001_saved_filters.sql` - Filtros salvos
- `20241223000002_entity_versions.sql` - Versionamento

## Status: 18/18 ✅
