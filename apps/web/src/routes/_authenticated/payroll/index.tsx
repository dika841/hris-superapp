import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Calculator, FileXls, UsersThree } from '@phosphor-icons/react'
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs'
import { Button } from '@hris/ui'
import { payrollApi, payrollKeys, type IPayrollRecord } from '../../../libs/api/payroll'
import { usePayrollQueries } from './_hooks/use-payroll-queries'
import {
  useTaxSimulatorForm,
  useCalculatePayrollForm,
  type TCalculatePayrollForm,
} from './_hooks/use-payroll-forms'
import { TaxSimulatorCard } from './_components/tax-simulator-card'
import { PayrollTable } from './_components/payroll-table'
import { CalculatePayrollModal } from './_components/calculate-payroll-modal'
import { BatchCalculateModal } from './_components/batch-calculate-modal'
import { PayslipModal } from './_components/payslip-modal'
import { useDebouncedCallback } from '../../../libs/hooks/use-debounce'

export const Route = createFileRoute('/_authenticated/payroll/')({
  component: PayrollPage,
})

function PayrollPage() {
  const queryClient = useQueryClient()
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Sync state with URL search params via nuqs
  const [selectedMonth, setSelectedMonthState] = useQueryState(
    'month',
    parseAsInteger.withDefault(currentMonth)
  )
  const [selectedYear, setSelectedYearState] = useQueryState(
    'year',
    parseAsInteger.withDefault(currentYear)
  )
  const [selectedStatus, setSelectedStatusState] = useQueryState(
    'status',
    parseAsString.withDefault('all')
  )
  const [urlSearch, setUrlSearch] = useQueryState('search', parseAsString.withDefault(''))

  // Local search state for immediate keystroke feedback
  const [localSearch, setLocalSearch] = React.useState(urlSearch)

  React.useEffect(() => {
    setLocalSearch(urlSearch)
  }, [urlSearch])

  const debouncedSetUrlSearch = useDebouncedCallback((val: string) => {
    const trimmed = val.trim()
    setUrlSearch(trimmed ? trimmed : null)
  }, 300)

  const handleSearchChange = (val: string) => {
    setLocalSearch(val)
    debouncedSetUrlSearch(val)
  }

  const [isCalcModalOpen, setIsCalcModalOpen] = React.useState(false)
  const [isBatchModalOpen, setIsBatchModalOpen] = React.useState(false)
  const [activePayslipRecord, setActivePayslipRecord] = React.useState<IPayrollRecord | null>(null)

  const {
    records,
    isLoading: recordsLoading,
    employees,
    calculateMutation,
    payMutation,
  } = usePayrollQueries(selectedMonth, selectedYear, selectedStatus)

  const { form: simForm, values: simValues } = useTaxSimulatorForm()

  const { data: simResult } = useQuery({
    queryKey: ['tax-preview', simValues.gross_salary, simValues.ptkp_status],
    queryFn: () =>
      payrollApi.previewTax({
        gross_salary: simValues.gross_salary || 0,
        ptkp_status: simValues.ptkp_status,
      }),
    enabled: simValues.gross_salary > 0,
  })

  const calcForm = useCalculatePayrollForm(async (value: TCalculatePayrollForm) => {
    await calculateMutation.mutateAsync({
      employee_id: value.employee_id,
      period_month: selectedMonth,
      period_year: selectedYear,
      overtime_hours: value.overtime_hours,
      bonus: value.bonus,
    })
    setIsCalcModalOpen(false)
  })

  const activePayslipEmployee = React.useMemo(() => {
    if (!activePayslipRecord) return undefined
    return employees.find((e) => e.id === activePayslipRecord.employee_id)
  }, [activePayslipRecord, employees])

  const activeEmployeesCount = React.useMemo(() => {
    return employees.filter((e) => e.is_active).length
  }, [employees])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Calculator className="h-6 w-6 text-primary" />
            Deterministic Payroll & PPh 21 TER Engine
          </h1>
          <p className="text-sm text-muted-foreground">
            Compliant with Minister of Finance Regulation PMK 168/2023 and PP 35/2021 overtime standards.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setIsBatchModalOpen(true)}
            className="gap-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
          >
            <UsersThree className="h-4 w-4" />
            Run Batch Payroll
          </Button>
          <Button onClick={() => setIsCalcModalOpen(true)} className="gap-2">
            <FileXls className="h-4 w-4" />
            Process Employee Payroll
          </Button>
        </div>
      </div>

      {/* Interactive PMK 168/2023 Tax Simulator Card */}
      <TaxSimulatorCard form={simForm} simResult={simResult} />

      {/* Payroll Records History */}
      <PayrollTable
        records={records}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedStatus={selectedStatus}
        search={localSearch}
        onSearchChange={handleSearchChange}
        onMonthChange={(m) => setSelectedMonthState(m === currentMonth ? null : m)}
        onYearChange={(y) => setSelectedYearState(y === currentYear ? null : y)}
        onStatusChange={(s) => setSelectedStatusState(s === 'all' ? null : s)}
        onMarkPaid={(id) => payMutation.mutate(id)}
        onViewPayslip={(record) => setActivePayslipRecord(record)}
        isPaying={payMutation.isPending}
        isLoading={recordsLoading}
      />

      {/* Calculate Individual Payroll Modal */}
      <CalculatePayrollModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        form={calcForm}
        employees={employees}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        isPending={calculateMutation.isPending}
      />

      {/* Batch Calculate Payroll Modal */}
      <BatchCalculateModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: payrollKeys.all })
        }}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        activeEmployeeCount={activeEmployeesCount}
      />

      {/* e-Payslip View & Print Modal */}
      <PayslipModal
        isOpen={!!activePayslipRecord}
        onClose={() => setActivePayslipRecord(null)}
        record={activePayslipRecord}
        employee={activePayslipEmployee}
      />
    </div>
  )
}
