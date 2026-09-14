import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs'
import {
  employeeKeys,
  employeesApi,
  type TCreateEmployeePayload,
  type ListEmployeesParams,
} from '../../../../libs/api/employees'
import { useDebouncedCallback } from '../../../../libs/hooks/use-debounce'

export function useEmployeeQueries() {
  const queryClient = useQueryClient()

  // URL search params state via nuqs
  const [urlSearch, setUrlSearch] = useQueryState('search', parseAsString.withDefault(''))
  const [department, setDepartmentState] = useQueryState(
    'department',
    parseAsString.withDefault('all')
  )
  const [status, setStatusState] = useQueryState('status', parseAsString.withDefault('all'))
  const [page, setPageState] = useQueryState('page', parseAsInteger.withDefault(1))
  const [pageSize, setPageSizeState] = useQueryState('pageSize', parseAsInteger.withDefault(10))

  // Immediate local search value for smooth input typing
  const [localSearch, setLocalSearch] = React.useState(urlSearch)

  // Keep local search synchronized when urlSearch changes externally
  React.useEffect(() => {
    setLocalSearch(urlSearch)
  }, [urlSearch])

  // Debounce writing search query to URL (300ms)
  const debouncedSetUrlSearch = useDebouncedCallback((val: string) => {
    const trimmed = val.trim()
    setUrlSearch(trimmed ? trimmed : null)
    setPageState(null) // reset to page 1 on new search
  }, 300)

  const handleSearchChange = React.useCallback(
    (val: string) => {
      setLocalSearch(val)
      debouncedSetUrlSearch(val)
    },
    [debouncedSetUrlSearch]
  )

  const handleDepartmentChange = React.useCallback(
    (dept: string) => {
      setDepartmentState(dept === 'all' ? null : dept)
      setPageState(null)
    },
    [setDepartmentState, setPageState]
  )

  const handleStatusChange = React.useCallback(
    (st: string) => {
      setStatusState(st === 'all' ? null : st)
      setPageState(null)
    },
    [setStatusState, setPageState]
  )

  const handlePageChange = React.useCallback(
    (p: number) => {
      setPageState(p <= 1 ? null : p)
    },
    [setPageState]
  )

  const handlePageSizeChange = React.useCallback(
    (ps: number) => {
      setPageSizeState(ps === 10 ? null : ps)
      setPageState(null)
    },
    [setPageSizeState, setPageState]
  )

  // Build backend query parameters from URL state
  const queryParams: ListEmployeesParams = React.useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: urlSearch.trim() || undefined,
      department: department !== 'all' ? department : undefined,
      status: status !== 'all' ? status : undefined,
    }),
    [page, pageSize, urlSearch, department, status]
  )

  const listQuery = useQuery({
    queryKey: employeeKeys.list(queryParams),
    queryFn: () => employeesApi.list(queryParams),
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
    page,
    pageSize,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    search: localSearch,
    setSearch: handleSearchChange,
    department,
    setDepartment: handleDepartmentChange,
    status,
    setStatus: handleStatusChange,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    createMutation,
  }
}
