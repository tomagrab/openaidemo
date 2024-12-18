import DataTablePagination from '@/components/ui/data-table-pagination';
import { Table } from '@tanstack/react-table';

type DataTableBottomProps<TData> = {
  table: Table<TData>;
};

export default function DataTableBottom<TData>({
  table,
}: DataTableBottomProps<TData>) {
  return <DataTablePagination table={table} />;
}
