import { useQuery } from '@tanstack/react-query'
import {
  attendanceApi,
  attendanceKeys,
  type ListAttendanceParams,
  type IAttendanceLog,
} from '#/libs/api/attendance'
import {
  formatTimeString,
  mapStatusToUI,
  type AttendanceRecordUI,
} from './attendance.types'

export function useAttendanceLogs(params?: ListAttendanceParams) {
  const query = useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceApi.list(params || { page: 1, page_size: 50 }),
  })

  const records: AttendanceRecordUI[] = (query.data?.data || []).map((l: IAttendanceLog) => ({
    id: l.id,
    name: l.employee_name,
    code: l.employee_code,
    department: l.department,
    date: l.date,
    checkIn: formatTimeString(l.check_in),
    checkOut: formatTimeString(l.check_out),
    status: mapStatusToUI(l.status),
    lateMinutes: l.late_duration_minutes,
    overtimeMinutes: l.overtime_minutes,
    notes: l.notes || '',
    autoClosed: l.auto_closed,
  }))

  return {
    records,
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useAttendanceStats(date?: string) {
  const query = useQuery({
    queryKey: attendanceKeys.stats(date),
    queryFn: () => attendanceApi.getStats(date),
  })

  const stats = {
    presentRate: query.data?.present_rate || '100%',
    overtimeHours: query.data?.total_overtime_hours || '0.0 Hrs',
    pendingLeaveRequests: query.data?.leave_count || 0,
    presentCount: query.data?.present_count || 0,
    lateCount: query.data?.late_count || 0,
    activeEmployees: query.data?.total_active_employees || 0,
  }

  return {
    stats,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}
