import * as React from 'react'
import { Buildings } from '@phosphor-icons/react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import type { IEmployee } from '../../../../libs/api/employees'

const DEPARTMENTS = [
  { value: 'all', label: 'All Departments' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Product', label: 'Product' },
  { value: 'Tax & Compliance', label: 'Tax & Compliance' },
  { value: 'People Operations', label: 'People Operations' },
]

const STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export interface EmployeeTableProps {
  employees: IEmployee[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  search: string
  onSearchChange: (search: string) => void
  department: string
  onDepartmentChange: (dept: string) => void
  status: string
  onStatusChange: (status: string) => void
  isLoading: boolean
}

export function EmployeeTable({
  employees,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  status,
  onStatusChange,
  isLoading,
}: EmployeeTableProps) {
  const columns = React.useMemo<ColumnDef<IEmployee>[]>(
    () => [
      {
        accessorKey: 'full_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">{row.original.full_name}</div>
            <div className="text-xs font-mono text-muted-foreground">{row.original.employee_code}</div>
          </div>
        ),
      },
      {
        accessorKey: 'department',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role & Dept" />,
        cell: ({ row }) => (
          <div>
            <div className="text-foreground">{row.original.position}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Buildings className="h-3 w-3" />
              {row.original.department}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'ptkp_status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="PTKP Bracket" />,
        cell: ({ row }) => <Badge variant="info">{row.original.ptkp_status}</Badge>,
      },
      {
        accessorKey: 'basic_salary',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Basic Salary" />,
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{formatRupiah(row.original.basic_salary)}</span>
        ),
        sortingFn: (rowA, rowB) => {
          const a = parseFloat(rowA.original.basic_salary) || 0
          const b = parseFloat(rowB.original.basic_salary) || 0
          return a - b
        },
      },
      {
        accessorKey: 'allowance_fixed',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Fixed Allowance" />,
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground">{formatRupiah(row.original.allowance_fixed)}</span>
        ),
        sortingFn: (rowA, rowB) => {
          const a = parseFloat(rowA.original.allowance_fixed) || 0
          const b = parseFloat(rowB.original.allowance_fixed) || 0
          return a - b
        },
      },
      {
        accessorKey: 'is_active',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'success' : 'default'}>
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    []
  )

  const filterSlot = (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Department Filter */}
      <Select value={department} onValueChange={onDepartmentChange}>
        <SelectTrigger className="h-9 w-[170px] text-xs">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          {DEPARTMENTS.map((dept) => (
            <SelectItem key={dept.value} value={dept.value} className="text-xs">
              {dept.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="h-9 w-[130px] text-xs">
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

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  return (
    <Card className="glass-panel">
      <CardHeader className="border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Workforce Directory</CardTitle>
            <CardDescription>Comprehensive directory of all onboarded personnel</CardDescription>
          </div>
          <Badge variant="secondary" className="w-fit text-xs font-mono">
            {total} Total Records
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <DataTable
          columns={columns}
          data={employees}
          isLoading={isLoading}
          searchValue={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search code, name, dept..."
          filterSlot={filterSlot}
          manualFiltering={true}
          manualPagination={true}
          pageIndex={page - 1}
          pageSize={pageSize}
          totalCount={total}
          pageCount={pageCount}
          onPageChange={(zeroIndex) => onPageChange(zeroIndex + 1)}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={[10, 20, 50]}
          emptyMessage="No employees found matching the specified filters."
        />
      </CardContent>
    </Card>
  )
}
