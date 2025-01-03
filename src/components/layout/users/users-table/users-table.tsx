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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectUser } from '@/lib/db/schema/schema'; // or wherever your types are
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
};

const columns: ColumnDef<UserRow>[] = [
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
  {
    accessorKey: 'firstName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
    cell: ({ row }) => {
      const firstName = row.original.firstName;
      return (
        <span className="flex flex-col items-center justify-center">
          {firstName}
        </span>
      );
    },
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
    cell: ({ row }) => {
      const lastName = row.original.lastName;
      return (
        <span className="flex flex-col items-center justify-center">
          {lastName}
        </span>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.original.email;
      return (
        <span className="flex flex-col items-center justify-center">
          {email}
        </span>
      );
    },
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    cell: ({ row }) => {
      const username = row.original.username;
      return (
        <span className="flex flex-col items-center justify-center">
          {username}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return (
        <span className="flex flex-col items-center justify-center">
          {new Date(createdAt).toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      const updatedAt = row.original.updatedAt;
      return (
        <span className="flex flex-col items-center justify-center">
          {new Date(updatedAt).toLocaleString()}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

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
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                Copy User ID
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/*
                3) The <DialogTrigger asChild> wraps exactly one child element: <DropdownMenuItem>
              */}
              <DialogTrigger asChild>
                <DropdownMenuItem>Quick View</DropdownMenuItem>
              </DialogTrigger>

              <DropdownMenuItem asChild>
                <Link href={`/users/${user.id}`}>View User</Link>
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
            <ScrollArea className="max-h-[calc(100vh-25dvh)]">
              <Card>
                <CardHeader>
                  <CardTitle>{user.fullName}</CardTitle>
                  <CardDescription>
                    {user.email} <Separator orientation="vertical" />{' '}
                    {user.username}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <p>
                    Created at:{' '}
                    <time>{new Date(user.createdAt).toLocaleDateString()}</time>
                  </p>
                  <p>
                    Updated at:{' '}
                    <time>{new Date(user.updatedAt).toLocaleDateString()}</time>
                  </p>
                </CardFooter>
              </Card>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      );
    },
  },
];

type UsersTableProps = {
  users: SelectUser[] | null;
};

export default function UsersTable({ users }: UsersTableProps) {
  // Convert the "SelectDocument" array into our local row type array
  const tableData: UserRow[] = useMemo(() => {
    if (!users) return [];
    return users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }, [users]);

  // If no data or empty array, show a simple fallback
  if (!tableData.length) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        <em>No users found.</em>
      </div>
    );
  }

  // Return your actual table
  return (
    <DataTable
      columns={columns}
      data={tableData}
      filterPlaceholder="Filter users…"
    />
  );
}
