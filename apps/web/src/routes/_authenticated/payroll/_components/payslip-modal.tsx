import {
  PrinterIcon,
  CheckCircleIcon,
  ClockIcon,
  ReceiptIcon,
} from "@phosphor-icons/react"
import {
  Dialog,
  DialogContent,
  Button,
} from "@hris/ui"
import { formatIDR } from "@hris/utils"
import type { IPayrollRecord } from "#/libs/api/payroll"

interface PayslipModalProps {
  isOpen: boolean
  onClose: () => void
  record: IPayrollRecord | null
  employee?: {
    full_name: string
    employee_code: string
    department: string
    position?: string
    ptkp_status?: string
  }
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export function PayslipModal({ isOpen, onClose, record, employee }: PayslipModalProps) {
  if (!record) return null

  const handlePrint = () => {
    window.print()
  }

  const periodString = `${MONTH_NAMES[record.period_month - 1]} ${record.period_year}`

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-6 sm:p-8 print:border-none print:shadow-none print:p-8 print:w-full print:max-w-none">
        <div className="flex items-center justify-between pb-4 border-b border-border print:hidden pr-8">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <ReceiptIcon className="h-5 w-5" />
            <span>e-Payslip Document</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="gap-1.5"
          >
            <PrinterIcon className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </Button>
        </div>

        <div className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-foreground">
            <div>
              <div className="text-xl font-extrabold tracking-tight text-foreground">
                HRIS <span className="text-primary font-normal">SUPERAPP</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Enterprise Workforce & Payroll Management
              </div>
            </div>
            <div className="sm:text-right">
              <div className="text-base font-bold text-foreground uppercase tracking-wide">
                Employee Payslip
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Pay Period: <strong className="text-foreground">{periodString}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/50 text-xs border border-border">
            <div>
              <div className="text-muted-foreground uppercase text-[10px] font-bold">
                Employee Name
              </div>
              <div className="font-semibold text-foreground mt-0.5">
                {employee?.full_name || "Employee"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground uppercase text-[10px] font-bold">
                Employee ID
              </div>
              <div className="font-mono font-semibold text-foreground mt-0.5">
                {employee?.employee_code || "-"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground uppercase text-[10px] font-bold">
                Department
              </div>
              <div className="font-semibold text-foreground mt-0.5">
                {employee?.department || "-"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground uppercase text-[10px] font-bold">
                PTKP Bracket / TER
              </div>
              <div className="font-semibold text-primary mt-0.5">
                {employee?.ptkp_status || "TK/0"} ({record.ter_category})
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border">
                Earnings Breakdown
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatIDR(record.basic_salary)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Fixed Allowance</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatIDR(record.allowance_fixed)}
                  </span>
                </div>
                {parseFloat(record.overtime_pay) > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">
                      Overtime Pay ({record.overtime_hours} hrs)
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {formatIDR(record.overtime_pay)}
                    </span>
                  </div>
                )}
                {parseFloat(record.bonus) > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Bonus & Incentives</span>
                    <span className="font-mono font-medium text-foreground">
                      {formatIDR(record.bonus)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border font-bold text-sm">
                  <span>Total Gross Earnings</span>
                  <span className="font-mono text-primary">
                    {formatIDR(record.gross_salary)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border">
                Deductions Breakdown
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">
                    PPh 21 Income Tax ({Number(parseFloat(record.ter_rate) * 100).toFixed(1)}%)
                  </span>
                  <span className="font-mono font-medium text-rose-600 dark:text-rose-400">
                    {formatIDR(record.pph21_amount)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">BPJS Old-Age Security (JHT 2%)</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatIDR(record.bpjs_jht_employee)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">BPJS Pension Security (JP 1%)</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatIDR(record.bpjs_jp_employee)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">BPJS Healthcare (1%)</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatIDR(record.bpjs_kes_employee)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-bold text-sm">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">
                    {formatIDR(record.total_deductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider">
                Net Pay (Take-Home Pay)
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Deterministic calculation (zero floating-point discrepancy)
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-primary font-mono">
              {formatIDR(record.take_home_pay)}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5">
              {record.is_paid ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 text-emerald-500" weight="fill" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    PAID (Disbursed)
                  </span>
                </>
              ) : (
                <>
                  <ClockIcon className="h-4 w-4 text-amber-500" weight="fill" />
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    PENDING (Awaiting Payment)
                  </span>
                </>
              )}
            </div>
            <div className="text-[11px]">
              This is an official computer-generated document from HRIS SuperApp. No signature required.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
