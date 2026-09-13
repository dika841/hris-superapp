import { createFileRoute } from '@tanstack/react-router'
import { CalendarCheck } from '@phosphor-icons/react'
import { useAttendanceData } from './_hooks/use-attendance-data'
import { AttendanceStats } from './_components/attendance-stats'
import { AttendanceTable } from './_components/attendance-table'

export const Route = createFileRoute('/_authenticated/attendance/')({
  component: AttendancePage,
})

function AttendancePage() {
  const { records, stats } = useAttendanceData()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <CalendarCheck className="h-6 w-6 text-primary" />
          Attendance & Leave Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Work shifts, overtime records, and leave request tracking.
        </p>
      </div>

      <AttendanceStats
        presentRate={stats.presentRate}
        overtimeHours={stats.overtimeHours}
        pendingLeaveRequests={stats.pendingLeaveRequests}
      />

      <AttendanceTable records={records} />
    </div>
  )
}
