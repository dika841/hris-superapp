import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  attendanceApi,
  attendanceKeys,
  type ClockInPayload,
  type ClockOutPayload,
} from '#/libs/api/attendance'

export function useTodayAttendance(employeeId?: string) {
  const query = useQuery({
    queryKey: attendanceKeys.today(employeeId),
    queryFn: () => attendanceApi.getToday(employeeId),
  })

  return {
    today: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useClockActions() {
  const queryClient = useQueryClient()

  const clockInMutation = useMutation({
    mutationFn: (payload: ClockInPayload) => attendanceApi.clockIn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all })
    },
  })

  const clockOutMutation = useMutation({
    mutationFn: (payload: ClockOutPayload) => attendanceApi.clockOut(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all })
    },
  })

  return {
    clockIn: clockInMutation.mutateAsync,
    isClockingIn: clockInMutation.isPending,
    clockInError: clockInMutation.error,
    clockOut: clockOutMutation.mutateAsync,
    isClockingOut: clockOutMutation.isPending,
    clockOutError: clockOutMutation.error,
  }
}
