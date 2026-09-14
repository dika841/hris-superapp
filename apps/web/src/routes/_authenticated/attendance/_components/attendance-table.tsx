import * as React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  DataTable,
  DataTableColumnHeader,
  type ColumnDef,
} from '@hris/ui'
import type { AttendanceRecord } from '../_hooks/use-attendance-data'

interface AttendanceTableProps {
  records: AttendanceRecord[]
  isLoading?: boolean
}

export function AttendanceTable({ records, isLoading = false }: AttendanceTableProps) {
  const columns = React.useMemo<ColumnDef<AttendanceRecord>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">{row.original.name}</div>
            <div className="text-xs font-mono text-muted-foreground">{row.original.code}</div>
          </div>
        ),
      },
      {
        accessorKey: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.date}</span>
        ),
      },
      {
        accessorKey: 'checkIn',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Check In" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-emerald-500 font-semibold">{row.original.checkIn}</span>
        ),
      },
      {
        accessorKey: 'checkOut',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Check Out" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.checkOut}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'On Time'
                ? 'success'
                : row.original.status === 'Late'
                ? 'warning'
                : 'info'
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
    ],
    []
  )

  return (
    <Card className="glass-panel">
      <CardHeader className="border-b border-border">
        <CardTitle>Daily Attendance Logs</CardTitle>
        <CardDescription>Verified biometric and web check-ins for the active period</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <DataTable
          columns={columns}
          data={records}
          isLoading={isLoading}
          searchPlaceholder="Search employee or code..."
          pageSize={10}
          pageSizeOptions={[10, 20, 50]}
          emptyMessage="No attendance logs recorded for this period."
        />
      </CardContent>
    </Card>
  )
}
