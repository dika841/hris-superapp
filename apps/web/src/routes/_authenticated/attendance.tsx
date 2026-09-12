import { createFileRoute } from '@tanstack/react-router'
import { CalendarCheck, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

export const Route = createFileRoute('/_authenticated/attendance')({
  component: AttendancePage,
})

function AttendancePage() {
  const sampleAttendance = [
    { name: 'Budi Santoso', code: 'EMP-1001', date: '2026-09-12', checkIn: '08:55', checkOut: '17:45', status: 'On Time' },
    { name: 'Siti Rahma', code: 'EMP-1002', date: '2026-09-12', checkIn: '09:12', checkOut: '18:10', status: 'Late' },
    { name: 'Dewi Lestari', code: 'EMP-1003', date: '2026-09-12', checkIn: '08:45', checkOut: '17:30', status: 'On Time' },
    { name: 'Ahmad Fauzi', code: 'EMP-1004', date: '2026-09-12', checkIn: '-', checkOut: '-', status: 'Annual Leave' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <CalendarCheck className="h-6 w-6 text-indigo-400" />
          Attendance & Leave Management
        </h1>
        <p className="text-sm text-slate-400">
          Work shifts, overtime records, and leave request tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Today's Present Rate</CardTitle>
            <Clock className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">96.4%</div>
            <p className="text-xs text-slate-400 mt-1">Normal business hours</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Overtime Hours (Month)</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">124.5 Hrs</div>
            <p className="text-xs text-slate-400 mt-1">PP 35/2021 Verified</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Pending Leave Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2 Requests</div>
            <p className="text-xs text-slate-400 mt-1">Awaiting manager approval</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel">
        <CardHeader className="border-b border-slate-800/80">
          <CardTitle>Daily Attendance Logs</CardTitle>
          <CardDescription>Verified biometric and web check-ins for the active period</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sampleAttendance.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-xs font-mono text-slate-500">{item.code}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{item.date}</td>
                  <td className="px-6 py-4 font-mono text-xs text-emerald-400">{item.checkIn}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-300">{item.checkOut}</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.status === 'On Time' ? 'success' : item.status === 'Late' ? 'warning' : 'info'}>
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
