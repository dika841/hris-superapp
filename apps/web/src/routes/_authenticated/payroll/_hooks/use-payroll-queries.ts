import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { payrollApi, payrollKeys, type TCalculatePayrollPayload } from '../../../../libs/api/payroll'
import { employeeKeys, employeesApi } from '../../../../libs/api/employees'

export function usePayrollQueries(month: number, year: number) {
  const queryClient = useQueryClient()

  const payrollQuery = useQuery({
    queryKey: payrollKeys.list({ month, year }),
    queryFn: () => payrollApi.list(month, year),
  })

  const employeesQuery = useQuery({
    queryKey: employeeKeys.list({ page: 1 }),
    queryFn: () => employeesApi.list({ page: 1, page_size: 100 }),
  })

  const calculateMutation = useMutation({
    mutationFn: (payload: TCalculatePayrollPayload) => payrollApi.calculate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all })
    },
  })

  const payMutation = useMutation({
    mutationFn: (id: string) => payrollApi.markPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all })
    },
  })

  return {
    records: payrollQuery.data || [],
    isLoading: payrollQuery.isLoading,
    employees: employeesQuery.data?.data || [],
    calculateMutation,
    payMutation,
  }
}
