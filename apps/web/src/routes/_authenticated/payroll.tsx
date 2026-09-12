import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calculator,
  Sparkles,
  
  
  
  FileSpreadsheet,
  
  
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { formatRupiah } from '../../components/ui/utils'
import { payrollApi, payrollKeys, TCalculatePayrollPayload } from '../../libs/api/payroll'
import { employeesApi, employeeKeys } from '../../libs/api/employees'

export const Route = createFileRoute('/_authenticated/payroll')({
  component: PayrollPage,
})

function PayrollPage() {
  const queryClient = useQueryClient()
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear())

  // Simulator State
  const [simSalary, setSimSalary] = React.useState('15000000')
  const [simPtkp, setSimPtkp] = React.useState('TK/0')

  // Run Calculation Modal State
  const [isCalcModalOpen, setIsCalcModalOpen] = React.useState(false)
  const [calcEmployeeId, setCalcEmployeeId] = React.useState('')
  const [calcOtHours, setCalcOtHours] = React.useState('0')
  const [calcBonus, setCalcBonus] = React.useState('0')

  // Queries
  const { data: payrollRecords, isLoading } = useQuery({
    queryKey: payrollKeys.list({ month: selectedMonth, year: selectedYear }),
    queryFn: () => payrollApi.list(selectedMonth, selectedYear),
  })

  const { data: employeesData } = useQuery({
    queryKey: employeeKeys.list({ page: 1 }),
    queryFn: () => employeesApi.list({ page: 1, page_size: 100 }),
  })

  // Tax Simulator Query
  const { data: simResult } = useQuery({
    queryKey: ['tax-preview', simSalary, simPtkp],
    queryFn: () => payrollApi.previewTax({ gross_salary: parseFloat(simSalary) || 0, ptkp_status: simPtkp }),
    enabled: !!simSalary,
  })

  // Mutations
  const calculateMutation = useMutation({
    mutationFn: (payload: TCalculatePayrollPayload) => payrollApi.calculate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all })
      setIsCalcModalOpen(false)
    },
  })

  const payMutation = useMutation({
    mutationFn: (id: string) => payrollApi.markPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all })
    },
  })

  const handleCalculateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!calcEmployeeId) return
    calculateMutation.mutate({
      employee_id: calcEmployeeId,
      period_month: selectedMonth,
      period_year: selectedYear,
      overtime_hours: parseFloat(calcOtHours) || 0,
      bonus: parseFloat(calcBonus) || 0,
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Calculator className="h-6 w-6 text-indigo-400" />
            Deterministic Payroll & PPh 21 TER Engine
          </h1>
          <p className="text-sm text-slate-400">
            Compliant with Minister of Finance Regulation PMK 168/2023 and PP 35/2021 overtime standards.
          </p>
        </div>
        <Button onClick={() => setIsCalcModalOpen(true)} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Process Employee Payroll
        </Button>
      </div>

      {/* Interactive PMK 168/2023 Tax Simulator Card */}
      <Card className="glass-panel border-indigo-500/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Calculator className="h-48 w-48 text-indigo-400" />
        </div>
        <CardHeader className="border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            Interactive PMK 168/2023 TER Simulator
          </div>
          <CardTitle>Real-Time Tax Deduction & Take-Home Pay Simulator</CardTitle>
          <CardDescription>
            Experiment with gross salary amounts and PTKP brackets to observe automatic TER A, B, or C slotting.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Gross Monthly Salary (IDR)</label>
              <Input
                type="number"
                value={simSalary}
                onChange={(e) => setSimSalary(e.target.value)}
                placeholder="15000000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">PTKP Status</label>
              <select
                value={simPtkp}
                onChange={(e) => setSimPtkp(e.target.value)}
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

            <div className="space-y-1 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">TER Category & Rate</div>
              <div className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                <span>{simResult?.ter_category || 'TER A'}</span>
                <span className="text-sm font-mono text-indigo-300">
                  ({((parseFloat(simResult?.ter_rate || '0')) * 100).toFixed(2)}%)
                </span>
              </div>
              <div className="text-[11px] text-slate-500">PPh 21: {formatRupiah(simResult?.pph21_monthly || '0')}</div>
            </div>

            <div className="space-y-1 bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/20">
              <div className="text-xs text-indigo-300">Estimated Take Home Pay</div>
              <div className="text-xl font-bold text-emerald-400">
                {formatRupiah(simResult?.estimated_take_home_pay || '0')}
              </div>
              <div className="text-[11px] text-slate-400">
                Total Deductions: {formatRupiah(simResult?.total_deductions || '0')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Batch List Card */}
      <Card className="glass-panel">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80">
          <div>
            <CardTitle>Payroll History & Execution</CardTitle>
            <CardDescription>
              Verified payroll calculations for period {selectedMonth}/{selectedYear}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Month {i + 1}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-slate-200"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Gross Salary</th>
                <th className="px-6 py-4">TER Bracket</th>
                <th className="px-6 py-4">PPh 21 Withholding</th>
                <th className="px-6 py-4">BPJS Deductions</th>
                <th className="px-6 py-4">Take Home Pay</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    Loading payroll records...
                  </td>
                </tr>
              ) : payrollRecords && payrollRecords.length > 0 ? (
                payrollRecords.map((record) => {
                  const bpjsTotal =
                    parseFloat(record.bpjs_jht_employee) +
                    parseFloat(record.bpjs_jp_employee) +
                    parseFloat(record.bpjs_kes_employee)

                  return (
                    <tr key={record.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-indigo-300">
                        {record.employee_id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 font-mono text-white">
                        {formatRupiah(record.gross_salary)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{record.ter_category}</Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-purple-400">
                        {formatRupiah(record.pph21_amount)}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {formatRupiah(bpjsTotal)}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-emerald-400">
                        {formatRupiah(record.take_home_pay)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={record.is_paid ? 'success' : 'warning'}>
                          {record.is_paid ? 'Paid' : 'Pending Payment'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!record.is_paid && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => payMutation.mutate(record.id)}
                            disabled={payMutation.isPending}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No payroll calculations recorded for this period yet. Click "Process Employee Payroll" to compute.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Calculate Payroll Modal */}
      {isCalcModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-400" />
                Compute Employee Payroll
              </h2>
              <button
                onClick={() => setIsCalcModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCalculateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Select Employee</label>
                <select
                  value={calcEmployeeId}
                  onChange={(e) => setCalcEmployeeId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-700 bg-slate-900/90 px-3 text-sm text-slate-100"
                  required
                >
                  <option value="">-- Choose Employee --</option>
                  {employeesData?.data.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.employee_code}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Period Month</label>
                  <Input type="number" value={selectedMonth} disabled />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Period Year</label>
                  <Input type="number" value={selectedYear} disabled />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Overtime Hours (PP 35)</label>
                  <Input
                    type="number"
                    value={calcOtHours}
                    onChange={(e) => setCalcOtHours(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Additional Bonus (IDR)</label>
                  <Input
                    type="number"
                    value={calcBonus}
                    onChange={(e) => setCalcBonus(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsCalcModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={calculateMutation.isPending || !calcEmployeeId}>
                  {calculateMutation.isPending ? 'Calculating...' : 'Run PMK 168 Calculation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
