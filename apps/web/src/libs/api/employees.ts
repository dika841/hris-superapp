import { api } from './client'

export interface IEmployee {
  id: string
  user_id?: string | null
  employee_code: string
  full_name: string
  national_id: string
  npwp?: string | null
  department: string
  position: string
  employment_status: string
  join_date: string
  basic_salary: string
  allowance_fixed: string
  ptkp_status: string
  bank_name?: string | null
  bank_account?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TCreateEmployeePayload {
  user_id?: string | null
  employee_code: string
  full_name: string
  national_id: string
  npwp?: string | null
  department: string
  position: string
  employment_status: string
  join_date: string
  basic_salary: number
  allowance_fixed: number
  ptkp_status: string
  bank_name?: string | null
  bank_account?: string | null
}

export interface TPaginatedEmployees {
  data: IEmployee[]
  total: number
  page: number
  page_size: number
}

// Query Key Factory (Rule 1 & Section 3.8)
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params?: { page?: number; department?: string }) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
}

export const employeesApi = {
  list: async (params?: { page?: number; page_size?: number; department?: string }): Promise<TPaginatedEmployees> => {
    const res = await api.get<TPaginatedEmployees>('/employees', { params })
    return res.data
  },
  get: async (id: string): Promise<IEmployee> => {
    const res = await api.get<IEmployee>(`/employees/${id}`)
    return res.data
  },
  create: async (payload: TCreateEmployeePayload): Promise<IEmployee> => {
    const res = await api.post<IEmployee>('/employees', payload)
    return res.data
  },
}
