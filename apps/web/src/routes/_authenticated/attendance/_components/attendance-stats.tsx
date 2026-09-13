import { Clock, Warning } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@hris/ui'

interface AttendanceStatsProps {
  presentRate: string
  overtimeHours: string
  pendingLeaveRequests: number
}

export function AttendanceStats({
  presentRate,
  overtimeHours,
  pendingLeaveRequests,
}: AttendanceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Today's Present Rate</CardTitle>
          <Clock className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{presentRate}</div>
          <p className="text-xs text-muted-foreground mt-1">Normal business hours</p>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Overtime Hours (Month)</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">{overtimeHours}</div>
          <p className="text-xs text-muted-foreground mt-1">PP 35/2021 Verified</p>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Pending Leave Requests</CardTitle>
          <Warning className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{pendingLeaveRequests} Requests</div>
          <p className="text-xs text-muted-foreground mt-1">Awaiting manager approval</p>
        </CardContent>
      </Card>
    </div>
  )
}
