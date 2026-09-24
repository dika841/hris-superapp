import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CalendarCheck, Clock, AirplaneTilt, Plus } from '@phosphor-icons/react'
import { Button, Badge } from '@hris/ui'

import { useAttendanceData } from './_hooks/use-attendance-data'
import { useLeaveQueries } from './_hooks/use-leave-queries'
import { AttendanceStats } from './_components/attendance-stats'
import { AttendanceTable } from './_components/attendance-table'
import { ClockCard } from './_components/clock-card'
import { LeaveBalancesCard } from './_components/leave-balances-card'
import { LeaveRequestModal } from './_components/leave-request-modal'
import { LeaveRequestsTable } from './_components/leave-requests-table'

export const Route = createFileRoute('/_authenticated/attendance/')({
  component: AttendanceAndLeavePage,
})

function AttendanceAndLeavePage() {
  const [activeTab, setActiveTab] = React.useState<'attendance' | 'leave'>('attendance')
  const [isLeaveModalOpen, setIsLeaveModalOpen] = React.useState(false)

  // Attendance Queries & Mutations
  const {
    records: attendanceRecords,
    stats: attendanceStats,
    isLoading: isAttendanceLoading,
    today,
    clockIn,
    clockOut,
    isClockingIn,
    isClockingOut,
  } = useAttendanceData()

  // Leave Queries & Mutations
  const {
    types: leaveTypes,
    balances: leaveBalances,
    requests: leaveRequests,
    isLoading: isLeaveLoading,
    submitRequest,
    isSubmitting: isSubmittingLeave,
    reviewRequest,
    isReviewing: isReviewingLeave,
  } = useLeaveQueries()

  const pendingLeaveCount = leaveRequests.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-8">
      {/* Page Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarCheck className="h-6 w-6 text-primary" />
            Workforce Attendance & Leave Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Biometric-attested check-ins, scheduled shift compliance, and statutory leave quota governance.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1.5 rounded-2xl bg-card/80 border border-border backdrop-blur-xl shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'attendance'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Attendance Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('leave')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'leave'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <AirplaneTilt className="h-4 w-4" />
            <span>Leave Requests</span>
            {pendingLeaveCount > 0 && (
              <Badge variant="warning" className="px-1.5 py-0 text-[10px] ml-1">
                {pendingLeaveCount}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'attendance' ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          <ClockCard
            todayData={today}
            onClockIn={clockIn}
            onClockOut={clockOut}
            isClockingIn={isClockingIn}
            isClockingOut={isClockingOut}
          />

          <AttendanceStats
            presentRate={attendanceStats.presentRate}
            overtimeHours={attendanceStats.overtimeHours}
            pendingLeaveRequests={pendingLeaveCount}
          />

          <AttendanceTable records={attendanceRecords} isLoading={isAttendanceLoading} />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header Action for Leave */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Annual & Statutory Leave Balances</h2>
              <p className="text-xs text-muted-foreground">Calculated in accordance with Indonesian Labor Law (UU Ketenagakerjaan)</p>
            </div>
            <Button
              onClick={() => setIsLeaveModalOpen(true)}
              className="bg-primary text-primary-foreground font-semibold flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              <span>Apply for Leave</span>
            </Button>
          </div>

          <LeaveBalancesCard balances={leaveBalances} />

          <LeaveRequestsTable
            requests={leaveRequests}
            isLoading={isLeaveLoading}
            onReview={reviewRequest}
            isReviewing={isReviewingLeave}
            canReview={true}
          />

          <LeaveRequestModal
            isOpen={isLeaveModalOpen}
            onClose={() => setIsLeaveModalOpen(false)}
            leaveTypes={leaveTypes}
            onSubmit={submitRequest}
            isSubmitting={isSubmittingLeave}
          />
        </div>
      )}
    </div>
  )
}
