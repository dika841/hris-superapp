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
import type { AttendanceRecordUI } from '../_hooks/use-attendance-data'

interface AttendanceTableProps {
  records: AttendanceRecordUI[]
  isLoading?: boolean
}

export function AttendanceTable({ records, isLoading = false }: AttendanceTableProps) {
  const columns = React.useMemo<ColumnDef<AttendanceRecordUI>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">{row.original.name}</div>
            <div className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <span>{row.original.code}</span>
              <span>•</span>
              <span className="text-primary/80">{row.original.department}</span>
            </div>
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
          <div>
            <span className="font-mono text-xs text-emerald-500 font-semibold">{row.original.checkIn}</span>
            {row.original.lateMinutes > 0 && (
              <span className="block text-[10px] text-amber-500 font-mono">+{row.original.lateMinutes}m late</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'checkOut',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Check Out" />,
        cell: ({ row }) => (
          <div>
            <span className="font-mono text-xs text-muted-foreground">{row.original.checkOut}</span>
            {row.original.overtimeMinutes > 0 && (
              <span className="block text-[10px] text-emerald-500 font-mono">+{row.original.overtimeMinutes}m OT</span>
            )}
            {row.original.autoClosed && (
              <span className="block text-[10px] text-amber-500/80 font-mono">Auto-closed</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const status = row.original.status
          const variant =
            status === 'On Time'
              ? 'success'
              : status === 'Late'
              ? 'warning'
              : status === 'Early Departure'
              ? 'secondary'
              : 'danger'

          return <Badge variant={variant as any}>{status}</Badge>
        },
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
          searchPlaceholder="Search employee, department or code..."
          pageSize={10}
          pageSizeOptions={[10, 20, 50]}
          emptyMessage="No attendance logs recorded for this period."
        />
      </CardContent>
    </Card>
  )
}
