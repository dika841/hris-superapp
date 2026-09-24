import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  leaveApi,
  leaveKeys,
  type SubmitLeavePayload,
  type ReviewLeavePayload,
} from '#/libs/api/leave'
import { attendanceKeys } from '#/libs/api/attendance'

export function useLeaveQueries(employeeId?: string, status?: string) {
  const queryClient = useQueryClient()

  const typesQuery = useQuery({
    queryKey: leaveKeys.types(),
    queryFn: () => leaveApi.getTypes(),
  })

  const balancesQuery = useQuery({
    queryKey: leaveKeys.balances(employeeId),
    queryFn: () => leaveApi.getBalances(employeeId),
  })

  const requestsQuery = useQuery({
    queryKey: leaveKeys.requests({ employee_id: employeeId, status }),
    queryFn: () => leaveApi.getRequests({ employee_id: employeeId, status, page: 1, page_size: 50 }),
  })

  const statsQuery = useQuery({
    queryKey: leaveKeys.stats(),
    queryFn: () => leaveApi.getStats(),
  })

  const submitMutation = useMutation({
    mutationFn: (payload: SubmitLeavePayload) => leaveApi.submitRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all })
    },
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewLeavePayload }) =>
      leaveApi.reviewRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all })
    },
  })

  return {
    types: typesQuery.data || [],
    balances: balancesQuery.data || [],
    requests: requestsQuery.data?.data || [],
    totalRequests: requestsQuery.data?.total || 0,
    stats: statsQuery.data,
    isLoading: typesQuery.isLoading || balancesQuery.isLoading || requestsQuery.isLoading,
    submitRequest: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error,
    reviewRequest: (id: string, payload: ReviewLeavePayload) => reviewMutation.mutateAsync({ id, payload }),
    isReviewing: reviewMutation.isPending,
    reviewError: reviewMutation.error,
  }
}
