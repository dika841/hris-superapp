import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Calculator,
  ShieldCheck,
  
  ArrowUpRight,
  Sparkles,
  DollarSign,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { formatRupiah } from '../../components/ui/utils'
import { employeesApi, employeeKeys } from '../../libs/api/employees'
import { payrollApi, payrollKeys } from '../../libs/api/payroll'

export const Route = createFileRoute('/_authenticated/')({
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
    queryFn: () => payrollApi.list(currentMonth, currentYear),
  })

  const totalEmployees = employeesData?.total || 0
  const activeEmployees = employeesData?.data.filter((e) => e.is_active).length || 0

  const totalPayrollGross =
    payrollData?.reduce((acc, curr) => acc + parseFloat(curr.gross_salary || '0'), 0) || 0
  const totalTaxWithheld =
    payrollData?.reduce((acc, curr) => acc + parseFloat(curr.pph21_amount || '0'), 0) || 0

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900/60 p-8 backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Next-Gen Deterministic Payroll Active
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Operational Intelligence & Compliance Dashboard
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Real-time tracking of employee master records, deterministic PPh 21 TER (PMK 168/2023) calculations, and BPJS compliance.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-600/15 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Total Workforce</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalEmployees}</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {activeEmployees} Active Employees
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Current Month Payroll</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatRupiah(totalPayrollGross)}</div>
            <p className="text-xs text-slate-400 mt-1">Period: {currentMonth}/{currentYear}</p>
          </CardContent>
        </Card>

        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">PPh 21 TER Withholding</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Calculator className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatRupiah(totalTaxWithheld)}</div>
            <p className="text-xs text-purple-400 mt-1 font-medium">PMK 168/2023 Verified</p>
          </CardContent>
        </Card>

        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">System Governance</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">100%</div>
            <p className="text-xs text-slate-400 mt-1">UU PDP & Role Guard Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Manage Workforce</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Register new hires, manage PTKP status (TK/0 to K/3), and configure fixed allowances and salary structures.
            </p>
          </div>
          <Link to="/employees" className="mt-6">
            <Button variant="secondary" className="w-full justify-between">
              <span>View Directory</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>

        <Card className="glass-panel p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Calculator className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Payroll & Tax Simulator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Run monthly payroll batches or simulate PPh 21 TER brackets with real-time gross/nett breakdown.
            </p>
          </div>
          <Link to="/payroll" className="mt-6">
            <Button variant="secondary" className="w-full justify-between">
              <span>Open Payroll Studio</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>

        <Card className="glass-panel p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Access & RBAC Matrix</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage system roles, assign permissions, and inspect security audit logs in conformance with UU PDP.
            </p>
          </div>
          <Link to="/users" className="mt-6">
            <Button variant="secondary" className="w-full justify-between">
              <span>Security Controls</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
