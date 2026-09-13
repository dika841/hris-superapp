import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Calculator, FileXls } from '@phosphor-icons/react'
import { Button } from '@hris/ui'
import { payrollApi } from '../../../libs/api/payroll'
import { usePayrollQueries } from './_hooks/use-payroll-queries'
import {
  useTaxSimulatorForm,
  useCalculatePayrollForm,
  type TCalculatePayrollForm,
} from './_hooks/use-payroll-forms'
import { TaxSimulatorCard } from './_components/tax-simulator-card'
import { PayrollTable } from './_components/payroll-table'
import { CalculatePayrollModal } from './_components/calculate-payroll-modal'

export const Route = createFileRoute('/_authenticated/payroll/')({
  component: PayrollPage,
})

function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear())
  const [isCalcModalOpen, setIsCalcModalOpen] = React.useState(false)

  const {
    records,
    isLoading: _recordsLoading,
    employees,
    calculateMutation,
    payMutation,
  } = usePayrollQueries(selectedMonth, selectedYear)

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
        <Button onClick={() => setIsCalcModalOpen(true)} className="gap-2">
          <FileXls className="h-4 w-4" />
          Process Employee Payroll
        </Button>
      </div>

      {/* Interactive PMK 168/2023 Tax Simulator Card */}
      <TaxSimulatorCard form={simForm} simResult={simResult} />

      {/* Payroll Records History */}
      <PayrollTable
        records={records}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onMarkPaid={(id) => payMutation.mutate(id)}
        isPaying={payMutation.isPending}
      />

      {/* Calculate Payroll Modal */}
      <CalculatePayrollModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        form={calcForm}
        employees={employees}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        isPending={calculateMutation.isPending}
      />
    </div>
  )
}
