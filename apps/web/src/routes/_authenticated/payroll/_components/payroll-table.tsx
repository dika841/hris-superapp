import * as React from 'react'
import { ReceiptIcon } from '@phosphor-icons/react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  DataTable,
  DataTableColumnHeader,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  type ColumnDef,
} from '@hris/ui'
import { formatRupiah } from '@hris/utils'
import type { IPayrollRecord } from '#/libs/api/payroll'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending Payment' },
]

interface PayrollTableProps {
  records: IPayrollRecord[]
  selectedMonth: number
  selectedYear: number
  selectedStatus: string
  search?: string
  onSearchChange?: (val: string) => void
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  onStatusChange: (status: string) => void
  onMarkPaid: (id: string) => void
  onViewPayslip?: (record: IPayrollRecord) => void
  isPaying: boolean
  isLoading?: boolean
}

export function PayrollTable({
  records,
  selectedMonth,
  selectedYear,
  selectedStatus,
  search,
  onSearchChange,
  onMonthChange,
  onYearChange,
  onStatusChange,
  onMarkPaid,
  onViewPayslip,
  isPaying,
  isLoading = false,
}: PayrollTableProps) {
  const columns = React.useMemo<ColumnDef<IPayrollRecord>[]>(
    () => [
      {
        accessorKey: 'employee_id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee ID" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.employee_id}</span>
        ),
      },
      {
        accessorKey: 'gross_salary',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gross Salary" />,
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{formatRupiah(row.original.gross_salary)}</span>
        ),
        sortingFn: (rowA, rowB) => {
          const a = parseFloat(rowA.original.gross_salary) || 0
          const b = parseFloat(rowB.original.gross_salary) || 0
          return a - b
        },
      },
      {
        accessorKey: 'ter_category',
        header: ({ column }) => <DataTableColumnHeader column={column} title="TER Bracket" />,
        cell: ({ row }) => <Badge variant="info">{row.original.ter_category}</Badge>,
      },
      {
        accessorKey: 'pph21_amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="PPh 21" />,
        cell: ({ row }) => (
          <span className="font-mono text-primary font-medium">
            {formatRupiah(row.original.pph21_amount)}
          </span>
        ),
        sortingFn: (rowA, rowB) => {
          const a = parseFloat(rowA.original.pph21_amount) || 0
          const b = parseFloat(rowB.original.pph21_amount) || 0
          return a - b
        },
      },
      {
        id: 'bpjs_total',
        header: 'BPJS Deductions',
        cell: ({ row }) => {
          const bpjsTotal =
            (parseFloat(row.original.bpjs_jht_employee) || 0) +
            (parseFloat(row.original.bpjs_jp_employee) || 0) +
            (parseFloat(row.original.bpjs_kes_employee) || 0)
          return <span className="font-mono text-muted-foreground">{formatRupiah(bpjsTotal)}</span>
        },
      },
      {
        accessorKey: 'take_home_pay',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Take Home Pay" />,
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-emerald-500">
            {formatRupiah(row.original.take_home_pay)}
          </span>
        ),
        sortingFn: (rowA, rowB) => {
          const a = parseFloat(rowA.original.take_home_pay) || 0
          const b = parseFloat(rowB.original.take_home_pay) || 0
          return a - b
        },
      },
      {
        accessorKey: 'is_paid',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => (
          <Badge variant={row.original.is_paid ? 'success' : 'warning'}>
            {row.original.is_paid ? 'Paid' : 'Pending Payment'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewPayslip?.(row.original)}
              className="h-8 px-2.5 text-xs gap-1.5"
            >
              <ReceiptIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>e-Payslip</span>
            </Button>
            {!row.original.is_paid && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onMarkPaid(row.original.id)}
                disabled={isPaying}
                className="h-8 text-xs"
              >
                Mark Paid
              </Button>
            )}
          </div>
        ),
      },
    ],
    [isPaying, onMarkPaid, onViewPayslip]
  )

  const filterControls = (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Month Selector */}
      <Select
        value={String(selectedMonth)}
        onValueChange={(val) => onMonthChange(parseInt(val))}
      >
        <SelectTrigger className="h-9 w-36 text-xs">
          <SelectValue placeholder="Select Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTH_NAMES.map((name, i) => (
            <SelectItem key={i + 1} value={String(i + 1)} className="text-xs">
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year Selector */}
      <Select
        value={String(selectedYear)}
        onValueChange={(val) => onYearChange(parseInt(val))}
      >
        <SelectTrigger className="h-9 w-24 text-xs">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2024" className="text-xs">2024</SelectItem>
          <SelectItem value="2025" className="text-xs">2025</SelectItem>
          <SelectItem value="2026" className="text-xs">2026</SelectItem>
          <SelectItem value="2027" className="text-xs">2027</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={selectedStatus}
        onValueChange={onStatusChange}
      >
        <SelectTrigger className="h-9 w-36 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((st) => (
            <SelectItem key={st.value} value={st.value} className="text-xs">
              {st.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <Card className="glass-panel">
      <CardHeader className="border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Payroll Ledger</CardTitle>
            <CardDescription>
              Auditable records of gross earnings, tax withholdings, and employee nett compensation.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="w-fit text-xs font-mono">
            {records.length} Records
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <DataTable
          columns={columns}
          data={records}
          isLoading={isLoading}
          searchValue={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search employee ID..."
          filterSlot={filterControls}
          pageSize={10}
          pageSizeOptions={[10, 20, 50]}
          emptyMessage="No payroll calculations recorded for this period yet. Click 'Process Employee Payroll' to compute."
        />
      </CardContent>
    </Card>
  )
}
