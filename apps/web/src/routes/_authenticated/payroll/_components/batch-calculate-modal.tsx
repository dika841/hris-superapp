import * as React from "react"
import {
  UsersThreeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CircleNotchIcon,
  MoneyIcon,
} from "@phosphor-icons/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Checkbox,
  Label,
  Button,
} from "@hris/ui"
import { formatIDR } from "@hris/utils"
import { payrollApi, type TBatchPayrollSummary } from "#/libs/api/payroll"

interface BatchCalculateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  selectedMonth: number
  selectedYear: number
  activeEmployeeCount: number
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export function BatchCalculateModal({
  isOpen,
  onClose,
  onSuccess,
  selectedMonth,
  selectedYear,
  activeEmployeeCount,
}: BatchCalculateModalProps) {
  const [skipExisting, setSkipExisting] = React.useState(true)
  const [isRunning, setIsRunning] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [summary, setSummary] = React.useState<TBatchPayrollSummary | null>(null)

  const handleRunBatch = async () => {
    setIsRunning(true)
    setError(null)
    try {
      const res = await payrollApi.calculateBatch({
        period_month: selectedMonth,
        period_year: selectedYear,
        skip_existing: skipExisting,
      })
      setSummary(res)
      onSuccess()
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to execute batch calculation. Please check server status."
      )
    } finally {
      setIsRunning(false)
    }
  }

  const handleClose = () => {
    setSummary(null)
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg space-y-5">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UsersThreeIcon className="h-5 w-5" weight="bold" />
            </div>
            <div>
              <DialogTitle>Run Batch Payroll Calculation</DialogTitle>
              <DialogDescription>
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear} • Deterministic PPh 21 TER Engine
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {summary ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
              <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" weight="fill" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                  Batch Process Completed Successfully!
                </div>
                <div>
                  Calculated payroll for <strong>{summary.processed_count}</strong> employee(s).{" "}
                  {summary.skipped_count > 0 && (
                    <span>({summary.skipped_count} skipped as already generated)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Total Gross Payout
                </span>
                <div className="text-sm font-bold text-foreground font-mono">
                  {formatIDR(summary.total_gross_salary)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  PPh 21 Tax Withheld
                </span>
                <div className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {formatIDR(summary.total_pph21_amount)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  BPJS Deductions
                </span>
                <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {formatIDR(summary.total_bpjs_amount)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Total Take-Home Pay
                </span>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatIDR(summary.total_take_home_pay)}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done & View Payroll Table
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Period:</span>
                <span className="font-semibold text-foreground">
                  {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Active Employees in Scope:</span>
                <span className="font-bold text-primary font-mono text-sm">
                  {activeEmployeeCount} Employee(s)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tax Compliance Rule:</span>
                <span className="font-medium text-foreground">
                  PMK 168/2023 (TER A, B, C)
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <XCircleIcon className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <Checkbox
                id="skip-existing"
                checked={skipExisting}
                onCheckedChange={(checked) => setSkipExisting(checked === true)}
              />
              <Label htmlFor="skip-existing" className="cursor-pointer text-xs font-normal text-muted-foreground">
                <strong className="text-foreground">Skip existing records:</strong> Do not recalculate for employees who already have a payroll record for this period.
              </Label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isRunning}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleRunBatch}
                disabled={isRunning || activeEmployeeCount === 0}
                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-md"
              >
                {isRunning ? (
                  <>
                    <CircleNotchIcon className="h-4 w-4 animate-spin" />
                    <span>Processing Batch...</span>
                  </>
                ) : (
                  <>
                    <MoneyIcon className="h-4 w-4" />
                    <span>Calculate All ({activeEmployeeCount})</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
