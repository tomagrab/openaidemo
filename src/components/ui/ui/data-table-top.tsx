import { Input } from '@/components/ui/input';
import DataTableViewOptions from '@/components/ui/data-table-view-options';
import { Table } from '@tanstack/react-table';

type DataTableTopProps<TData> = {
  placeholder?: string | undefined;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  table: Table<TData>;
};

export default function DataTableTop<TData>({
  placeholder,
  globalFilter,
  setGlobalFilter,
  table,
}: DataTableTopProps<TData>) {
  return (
    <>
      <Input
        placeholder={placeholder}
        value={globalFilter}
        onChange={event => setGlobalFilter(event.target.value)}
        className=""
      />
      <DataTableViewOptions table={table} />
    </>
  );
}
