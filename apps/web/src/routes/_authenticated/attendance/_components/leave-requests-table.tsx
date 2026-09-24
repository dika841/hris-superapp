import * as React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button,
  DataTable,
  DataTableColumnHeader,
  type ColumnDef,
} from '@hris/ui'
import { Check, X, FileText } from '@phosphor-icons/react'
import type { ILeaveRequest, ReviewLeavePayload } from '#/libs/api/leave'

interface LeaveRequestsTableProps {
  requests: ILeaveRequest[]
  isLoading?: boolean
  onReview: (id: string, payload: ReviewLeavePayload) => Promise<unknown>
  isReviewing?: boolean
  canReview?: boolean
}

export function LeaveRequestsTable({
  requests,
  isLoading = false,
  onReview,
  isReviewing = false,
  canReview = true,
}: LeaveRequestsTableProps) {
  const columns = React.useMemo<ColumnDef<ILeaveRequest>[]>(
    () => [
      {
        accessorKey: 'employee_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">{row.original.employee_name}</div>
            <div className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <span>{row.original.employee_code}</span>
              <span>•</span>
              <span className="text-primary/80">{row.original.department}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'leave_type_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => (
          <span className="font-medium text-xs text-foreground">{row.original.leave_type_name}</span>
        ),
      },
      {
        accessorKey: 'start_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
        cell: ({ row }) => (
          <div>
            <div className="font-mono text-xs text-foreground">
              {row.original.start_date} → {row.original.end_date}
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              {row.original.total_days} working {row.original.total_days === 1 ? 'day' : 'days'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'reason',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Reason" />,
        cell: ({ row }) => (
          <div className="max-w-xs">
            <p className="text-xs text-foreground truncate" title={row.original.reason}>
              {row.original.reason}
            </p>
            {row.original.attachment_url && (
              <a
                href={row.original.attachment_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-0.5"
              >
                <FileText className="h-3 w-3" />
                <span>View Attachment</span>
              </a>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const s = row.original.status
          const variant =
            s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : 'warning'
          return (
            <Badge variant={variant as any} className="capitalize">
              {s}
            </Badge>
          )
        },
      },
      {
        id: 'actions',
        header: 'Approval',
        cell: ({ row }) => {
          if (!canReview || row.original.status !== 'pending') {
            return (
              <span className="text-xs text-muted-foreground/60 italic">
                {row.original.status !== 'pending' ? 'Completed' : 'View only'}
              </span>
            )
          }

          return (
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={isReviewing}
                onClick={() => onReview(row.original.id, { status: 'approved' })}
                className="h-7 px-2 text-xs bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border-emerald-500/30"
                title="Approve Leave Request"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Approve
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={isReviewing}
                onClick={() => onReview(row.original.id, { status: 'rejected' })}
                className="h-7 px-2 text-xs bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border-rose-500/30"
                title="Reject Leave Request"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Reject
              </Button>
            </div>
          )
        },
      },
    ],
    [canReview, isReviewing, onReview]
  )

  return (
    <Card className="glass-panel">
      <CardHeader className="border-b border-border">
        <CardTitle>Leave & Time-Off Requests</CardTitle>
        <CardDescription>
          Submissions and tiered managerial approvals in accordance with statutory leave quotas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <DataTable
          columns={columns}
          data={requests}
          isLoading={isLoading}
          searchPlaceholder="Search employee, category, or reason..."
          pageSize={10}
          pageSizeOptions={[10, 20, 50]}
          emptyMessage="No leave requests submitted yet."
        />
      </CardContent>
    </Card>
  )
}
