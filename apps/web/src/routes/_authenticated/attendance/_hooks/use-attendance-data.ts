import { useQueryClient } from '@tanstack/react-query'
import { attendanceKeys, type ListAttendanceParams } from '#/libs/api/attendance'
import {
  useAttendanceLogs,
  useAttendanceStats,
} from './use-attendance-queries'
import {
  useTodayAttendance,
  useClockActions,
} from './use-clock-action'

export type { AttendanceRecordUI } from './attendance.types'
export { mapStatusToUI, formatTimeString } from './attendance.types'
export { useAttendanceLogs, useAttendanceStats } from './use-attendance-queries'
export { useTodayAttendance, useClockActions } from './use-clock-action'

export function useAttendanceData(params?: ListAttendanceParams) {
  const queryClient = useQueryClient()
  const { records, isLoading: isLogsLoading } = useAttendanceLogs(params)
  const { stats, isLoading: isStatsLoading } = useAttendanceStats(params?.date)
  const { today, isLoading: isTodayLoading } = useTodayAttendance(params?.employee_id)
  const clockActions = useClockActions()

  return {
    records,
    stats,
    isLoading: isLogsLoading || isStatsLoading,
    today,
    isTodayLoading,
    ...clockActions,
    refetchAll: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all })
    },
  }
}
