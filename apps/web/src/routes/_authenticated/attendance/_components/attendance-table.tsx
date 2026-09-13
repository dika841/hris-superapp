import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@hris/ui'
import type { AttendanceRecord } from '../_hooks/use-attendance-data'

interface AttendanceTableProps {
  records: AttendanceRecord[]
}

export function AttendanceTable({ records }: AttendanceTableProps) {
  return (
    <Card className="glass-panel">
      <CardHeader className="border-b border-border">
        <CardTitle>Daily Attendance Logs</CardTitle>
        <CardDescription>Verified biometric and web check-ins for the active period</CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Check In</th>
              <th className="px-6 py-4">Check Out</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{item.name}</div>
                  <div className="text-xs font-mono text-muted-foreground">{item.code}</div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{item.date}</td>
                <td className="px-6 py-4 font-mono text-xs text-emerald-500 font-semibold">{item.checkIn}</td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{item.checkOut}</td>
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
  )
}
