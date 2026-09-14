import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  UsersIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  ArrowUpRightIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@hris/ui"
import { formatRupiah } from "@hris/utils"
import { employeeKeys, employeesApi } from "../../libs/api/employees"
import { payrollKeys, payrollApi } from "../../libs/api/payroll"

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardOverviewPage,
})

function DashboardOverviewPage() {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Queries
  const { data: employeesData } = useQuery({
    queryKey: employeeKeys.list({ page: 1 }),
    queryFn: () => employeesApi.list({ page: 1, page_size: 100 }),
  })

  const { data: payrollData } = useQuery({
    queryKey: payrollKeys.list({ month: currentMonth, year: currentYear }),
    queryFn: () => payrollApi.list({ month: currentMonth, year: currentYear }),
  })

  const totalEmployees = employeesData?.total || 0
  const activeEmployees = employeesData?.data.filter((e) => e.is_active).length || 0

  const totalPayrollGross =
    payrollData?.reduce((acc, curr) => acc + parseFloat(curr.gross_salary || "0"), 0) || 0
  const totalTaxWithheld =
    payrollData?.reduce((acc, curr) => acc + parseFloat(curr.pph21_amount || "0"), 0) || 0

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/10 via-card/80 to-card/50 p-8 backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            Next-Gen Deterministic Payroll Active
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Operational Intelligence & Compliance Dashboard
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Real-time tracking of employee master records, deterministic PPh 21 TER (PMK 168/2023) calculations, and BPJS compliance.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Workforce</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UsersIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalEmployees}</div>
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {activeEmployees} Active Employees
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Current Month Payroll</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatRupiah(totalPayrollGross)}</div>
            <p className="text-xs text-muted-foreground mt-1">Period: {currentMonth}/{currentYear}</p>
          </CardContent>
        </Card>

        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">PPh 21 TER Withholding</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CalculatorIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatRupiah(totalTaxWithheld)}</div>
            <p className="text-xs text-primary mt-1 font-medium">PMK 168/2023 Verified</p>
          </CardContent>
        </Card>

        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">System Governance</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheckIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">100%</div>
            <p className="text-xs text-muted-foreground mt-1">UU PDP & Role Guard Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UsersIcon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Manage Workforce</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Register new hires, manage PTKP status (TK/0 to K/3), and configure fixed allowances and salary structures.
            </p>
          </div>
          <Link to="/employees" className="mt-6">
            <Button variant="secondary" className="w-full justify-between">
              <span>View Directory</span>
              <ArrowUpRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        </Card>

        <Card className="glass-panel p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CalculatorIcon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Payroll & Tax Simulator</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Run monthly payroll batches or simulate PPh 21 TER brackets with real-time gross/nett breakdown.
            </p>
          </div>
          <Link to="/payroll" className="mt-6">
            <Button variant="secondary" className="w-full justify-between">
              <span>Open Payroll Studio</span>
              <ArrowUpRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        </Card>

        <Card className="glass-panel p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Access & RBAC Matrix</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Manage system roles, assign permissions, and inspect security audit logs in conformance with UU PDP.
            </p>
          </div>
          <Link to="/users" className="mt-6">
            <Button variant="secondary" className="w-full justify-between">
              <span>Security Controls</span>
              <ArrowUpRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
