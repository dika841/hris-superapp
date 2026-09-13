import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
} from '@hris/ui'
import { formatRupiah } from '@hris/utils'
import type { IPayrollRecord } from '../../../../libs/api/payroll'

interface PayrollTableProps {
  records: IPayrollRecord[]
  selectedMonth: number
  selectedYear: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  onMarkPaid: (id: string) => void
  isPaying: boolean
}

export function PayrollTable({
  records,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onMarkPaid,
  isPaying,
}: PayrollTableProps) {
  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border">
        <div>
          <CardTitle>Payroll Ledger</CardTitle>
          <CardDescription>
            Auditable records of gross earnings, tax withholdings, and employee nett compensation.
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            className="h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Month {i + 1}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
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
          <tbody className="divide-y divide-border">
            {records.length > 0 ? (
              records.map((record) => {
                const bpjsTotal =
                  (parseFloat(record.bpjs_jht_employee) || 0) +
                  (parseFloat(record.bpjs_jp_employee) || 0) +
                  (parseFloat(record.bpjs_kes_employee) || 0)
                return (
                  <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {record.employee_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {formatRupiah(record.gross_salary)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{record.ter_category}</Badge>
                    </td>
                    <td className="px-6 py-4 font-mono text-primary">
                      {formatRupiah(record.pph21_amount)}
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      {formatRupiah(bpjsTotal)}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-emerald-500">
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
                          onClick={() => onMarkPaid(record.id)}
                          disabled={isPaying}
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
                <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                  No payroll calculations recorded for this period yet. Click "Process Employee Payroll" to compute.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
