'use no memo';

import { useState } from 'react';
import {
  //   ColumnDef,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { GetAttendanceSessionsReturnType } from 'convex/schema';
// import type { Id } from 'convex/_generated/dataModel';

interface AttendanceSessionsTableProps {
  sessions: GetAttendanceSessionsReturnType;
  //   courseId: Id<'courses'>;
}

type AttendanceSession = GetAttendanceSessionsReturnType[0];

const columns: ColumnDef<AttendanceSession>[] = [
  {
    id: 'sn',
    header: 'SN',
    cell: ({ row, table }) => {
      // Calculate session number based on sorted order (newest first)
      const currentPageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      const rowIndex = row.index;
      const totalRows = table.getFilteredRowModel().rows.length;

      // Since we sort by newest first, we need to reverse the numbering
      const sessionNumber =
        totalRows - (currentPageIndex * pageSize + rowIndex);

      return (
        <div className="font-medium text-muted-foreground">{sessionNumber}</div>
      );
    },
    size: 60,
  },
  {
    accessorKey: '_creationTime',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('_creationTime'));
      return (
        <div className="font-medium">
          {date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      );
    },
  },
  {
    accessorKey: '_creationTime',
    id: 'time',
    header: 'Time',
    cell: ({ row }) => {
      const date = new Date(row.getValue('_creationTime'));
      return (
        <div className="text-muted-foreground">
          {date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'active'
              ? 'default'
              : status === 'pending'
                ? 'secondary'
                : status === 'cancelled'
                  ? 'destructive'
                  : 'outline'
          }
          className={
            status === 'active'
              ? 'bg-green-100 text-green-800 border-green-200'
              : status === 'pending'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                : status === 'cancelled'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-gray-100 text-gray-800 border-gray-200'
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const session = row.original;
      return (
        <div className="text-right">
          <Link
            to="/dashboard/lecturer/$lecturerCourseId/$attendanceSessionId"
            params={{
              attendanceSessionId: session._id,
              lecturerCourseId: session.courseId,
            }}
          >
            <Button variant="ghost" size="sm" className="text-primary">
              View Details
            </Button>
          </Link>
        </div>
      );
    },
  },
];

export function AttendanceSessionsTable({
  sessions,
  //   courseId,
}: AttendanceSessionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: '_creationTime', desc: true }, // Sort by newest first
  ]);

  const table = useReactTable({
    data: sessions,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 5, // Show 5 sessions per page
      },
    },
  });

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No attendance sessions yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first attendance session to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sessions count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
