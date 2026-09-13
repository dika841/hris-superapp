import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeKeys, employeesApi, type TCreateEmployeePayload } from '../../../../libs/api/employees'

export function useEmployeeQueries(page = 1, pageSize = 100) {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: employeeKeys.list({ page }),
    queryFn: () => employeesApi.list({ page, page_size: pageSize }),
  })

  const createMutation = useMutation({
    mutationFn: (payload: TCreateEmployeePayload) => employeesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })

  return {
    employees: listQuery.data?.data || [],
    total: listQuery.data?.total || 0,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    createMutation,
  }
}
