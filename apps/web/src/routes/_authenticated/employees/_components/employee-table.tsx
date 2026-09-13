import * as React from 'react'
import { MagnifyingGlass, Buildings } from '@phosphor-icons/react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Badge,
} from '@hris/ui'
import { formatRupiah } from '@hris/utils'
import type { IEmployee } from '../../../../libs/api/employees'

export interface EmployeeTableProps {
  employees: IEmployee[]
  isLoading: boolean
}

export function EmployeeTable({ employees, isLoading }: EmployeeTableProps) {
  const [search, setSearch] = React.useState('')

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border">
        <div>
          <CardTitle>Active Employees</CardTitle>
          <CardDescription>Comprehensive directory of all onboarded personnel</CardDescription>
        </div>
        <div className="relative w-full md:w-72">
          <MagnifyingGlass className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, name, dept..."
            className="pl-9 h-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Role & Dept</th>
              <th className="px-6 py-4">PTKP Bracket</th>
              <th className="px-6 py-4">Basic Salary</th>
              <th className="px-6 py-4">Fixed Allowance</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  Loading workforce directory...
                </td>
              </tr>
            ) : filteredEmployees && filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{employee.full_name}</div>
                    <div className="text-xs font-mono text-muted-foreground">{employee.employee_code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-foreground">{employee.position}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Buildings className="h-3 w-3" />
                      {employee.department}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="info">{employee.ptkp_status}</Badge>
                  </td>
                  <td className="px-6 py-4 font-mono text-foreground">
                    {formatRupiah(employee.basic_salary)}
                  </td>
                  <td className="px-6 py-4 font-mono text-muted-foreground">
                    {formatRupiah(employee.allowance_fixed)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={employee.is_active ? 'success' : 'default'}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  No employees registered yet. Click "Add Employee" above to add your first hire.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
