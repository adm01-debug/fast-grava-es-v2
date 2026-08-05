import { BasicTable, StripedTable } from './tables/BasicAndStripedTables';
import { BadgeTable, ActionTable, CompactTable, SelectionTable, PaginationTable, TableUsageGuide } from './tables/InteractiveTables';

export function TablesSection() {
  return (
    <div className="space-y-6">
      <BasicTable />
      <StripedTable />
      <BadgeTable />
      <ActionTable />
      <CompactTable />
      <SelectionTable />
      <PaginationTable />
      <TableUsageGuide />
    </div>
  );
}
