'use client';

import React, { useMemo } from 'react';
import DataTable from '@/components/ui/data-table';
import DataTableColumnHeader from '@/components/ui/data-table-column-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectDocument } from '@/lib/db/schema/schema'; // or wherever your types are
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '../../markdown/markdown-renderer/markdown-renderer';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * 1) A local row type for our DataTable.
 *    We only display id, title, createdAt, and updatedAt in this table.
 *    (No need for 'content' or 'embedding' columns here.)
 */
type DocumentRow = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * 2) Column definitions for our Documents table
 */
const columns: ColumnDef<DocumentRow>[] = [
  // A "select" checkbox column for multi-row selection:
  {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },

  // Title column
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const val = row.original.title;
      return (
        <span className="flex flex-col items-center justify-center truncate">
          {val}
        </span>
      );
    },
  },

  // Created At column
  {
    accessorKey: 'createdAt',
    accessorFn: row => new Date(row.createdAt).toLocaleString(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      // Convert to a nice locale string, or whatever date format you want
      const date = new Date(row.original.createdAt).toLocaleString();
      return (
        <span className="flex flex-col items-center justify-center">
          {date}
        </span>
      );
    },
  },

  // Updated At column
  {
    accessorKey: 'updatedAt',
    accessorFn: row => new Date(row.updatedAt).toLocaleString(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.updatedAt).toLocaleString();
      return (
        <span className="flex flex-col items-center justify-center">
          {date}
        </span>
      );
    },
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      const document = row.original;

      return (
        <Dialog>
          {/* The entire dropdown is inside <Dialog>. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {/* 
                1) A normal label, outside of <DialogTrigger>.
                2) It's a separate item and not the one that triggers the Dialog.
              */}
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(document.id)}
              >
                Copy Document ID
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* 
                3) The <DialogTrigger asChild> wraps exactly 
                   one child element: <DropdownMenuItem> 
              */}
              <DialogTrigger asChild>
                <DropdownMenuItem>Quick View</DropdownMenuItem>
              </DialogTrigger>

              <DropdownMenuItem asChild>
                <Link href={`/documents/${document.id}`}>View Document</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 
            The actual Dialog content is placed after 
            the dropdown, but still within <Dialog>.
          */}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick View</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(100vh-50dvh)]">
              <Card>
                <CardHeader>
                  <CardTitle>{document.title}</CardTitle>
                  <CardDescription>
                    <Badge>V-Track Knowledge Document</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MarkdownRenderer content={document.content} />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p>
                    Created at:{' '}
                    <time>
                      {new Date(document.createdAt).toLocaleDateString()}
                    </time>
                  </p>
                  <p>
                    Updated at:{' '}
                    <time>
                      {new Date(document.updatedAt).toLocaleDateString()}
                    </time>
                  </p>
                </CardFooter>
              </Card>
            </ScrollArea>
            <DialogFooter>
              <Button type="submit">Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    },
  },
];

/**
 * 3) The main DocumentsTable component.
 *    It expects an array of "SelectDocument" or possibly null.
 *    We'll adapt them into "DocumentRow".
 */
type DocumentsTableProps = {
  data: SelectDocument[] | null;
};

export default function DocumentsTable({ data }: DocumentsTableProps) {
  // Convert the "SelectDocument" array into our local row type array
  const tableData: DocumentRow[] = useMemo(() => {
    if (!data) return [];
    return data.map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }, [data]);

  // If no data or empty array, show a simple fallback
  if (!tableData.length) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        <em>No documents found.</em>
      </div>
    );
  }

  // Return your actual table
  return (
    <DataTable
      columns={columns}
      data={tableData}
      filterPlaceholder="Filter documents…"
    />
  );
}
