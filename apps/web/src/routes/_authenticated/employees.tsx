import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Search, UserPlus, Building } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { formatRupiah } from '../../components/ui/utils'
import { employeesApi, employeeKeys, TCreateEmployeePayload } from '../../libs/api/employees'

export const Route = createFileRoute('/_authenticated/employees')({
  component: EmployeesPage,
})

function EmployeesPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // Form State
  const [employeeCode, setEmployeeCode] = React.useState(`EMP-${Math.floor(1000 + Math.random() * 9000)}`)
  const [fullName, setFullName] = React.useState('')
  const [nationalId, setNationalId] = React.useState('')
  const [department, setDepartment] = React.useState('Engineering')
  const [position, setPosition] = React.useState('Software Engineer')
  const [employmentStatus] = React.useState('permanent')
  const [ptkpStatus, setPtkpStatus] = React.useState('TK/0')
  const [basicSalary, setBasicSalary] = React.useState('12000000')
  const [allowanceFixed, setAllowanceFixed] = React.useState('2000000')
  const [bankName, setBankName] = React.useState('BCA')
  const [bankAccount, setBankAccount] = React.useState('8830192831')

  const { data: employeesData, isLoading } = useQuery({
    queryKey: employeeKeys.list({ page: 1 }),
    queryFn: () => employeesApi.list({ page: 1, page_size: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: (payload: TCreateEmployeePayload) => employeesApi.create(payload),
    onSuccess: () => {
      // Invalidate queries on mutation (Rule 2)
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
      setIsModalOpen(false)
      // reset form
      setFullName('')
      setNationalId('')
      setEmployeeCode(`EMP-${Math.floor(1000 + Math.random() * 9000)}`)
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      employee_code: employeeCode,
      full_name: fullName,
      national_id: nationalId,
      department,
      position,
      employment_status: employmentStatus,
      join_date: new Date().toISOString().slice(0, 10),
      basic_salary: parseFloat(basicSalary) || 0,
      allowance_fixed: parseFloat(allowanceFixed) || 0,
      ptkp_status: ptkpStatus,
      bank_name: bankName,
      bank_account: bankAccount,
    })
  }

  const filteredEmployees = employeesData?.data.filter(
    (e) =>
      e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-indigo-400" />
            Workforce Directory
          </h1>
          <p className="text-sm text-slate-400">
            Employee master records with structured PTKP status and compensation profiles.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Directory Card */}
      <Card className="glass-panel">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, code, or department..."
              className="pl-10"
            />
          </div>
          <div className="text-xs text-slate-400">
            Showing {filteredEmployees?.length || 0} of {employeesData?.total || 0} employee(s)
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role & Dept</th>
                <th className="px-6 py-4">PTKP Bracket</th>
                <th className="px-6 py-4">Basic Salary</th>
                <th className="px-6 py-4">Fixed Allowance</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Loading workforce directory...
                  </td>
                </tr>
              ) : filteredEmployees && filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{employee.full_name}</div>
                      <div className="text-xs font-mono text-slate-500">{employee.employee_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-200">{employee.position}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {employee.department}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{employee.ptkp_status}</Badge>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-200">
                      {formatRupiah(employee.basic_salary)}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">
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
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No employees registered yet. Click "Add Employee" above to add your first hire.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-400" />
                Register New Employee
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Employee Code</label>
                  <Input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Full Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Budi Santoso" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">National ID (NIK)</label>
                  <Input value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="3171xxxxxxxxxxxx" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">PTKP Status (PMK 168)</label>
                  <select
                    value={ptkpStatus}
                    onChange={(e) => setPtkpStatus(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-700 bg-slate-900/90 px-3 text-sm text-slate-100"
                  >
                    <option value="TK/0">TK/0 (TER A)</option>
                    <option value="TK/1">TK/1 (TER A)</option>
                    <option value="TK/2">TK/2 (TER B)</option>
                    <option value="TK/3">TK/3 (TER B)</option>
                    <option value="K/0">K/0 (TER A)</option>
                    <option value="K/1">K/1 (TER B)</option>
                    <option value="K/2">K/2 (TER B)</option>
                    <option value="K/3">K/3 (TER C)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Department</label>
                  <Input value={department} onChange={(e) => setDepartment(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Position</label>
                  <Input value={position} onChange={(e) => setPosition(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Basic Monthly Salary (IDR)</label>
                  <Input type="number" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Fixed Allowance (IDR)</label>
                  <Input type="number" value={allowanceFixed} onChange={(e) => setAllowanceFixed(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Bank Name</label>
                  <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Bank Account No.</label>
                  <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Saving...' : 'Register Employee'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
