import { api } from './client'

export interface ILeaveType {
  id: string
  code: string
  name: string
  default_days_per_year: number
  is_paid: boolean
  requires_attachment: boolean
}

export interface ILeaveBalance {
  id: string
  employee_id: string
  leave_type_id: string
  leave_type_code: string
  leave_type_name: string
  year: number
  allocated_days: number
  used_days: number
  pending_days: number
  remaining_days: number
  is_paid: boolean
}

export interface ILeaveRequest {
  id: string
  employee_id: string
  employee_name: string
  employee_code: string
  department: string
  leave_type_id: string
  leave_type_code: string
  leave_type_name: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  attachment_url?: string | null
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by?: string | null
  approval_notes?: string | null
  approved_at?: string | null
  created_at: string
}

export interface ILeaveStats {
  pending_count: number
  approved_this_month: number
  employees_on_leave_today: number
}

export interface SubmitLeavePayload {
  employee_id?: string
  leave_type_id: string
  start_date: string
  end_date: string
  reason: string
  attachment_url?: string
}

export interface ReviewLeavePayload {
  status: 'approved' | 'rejected'
  approval_notes?: string
}

export const leaveKeys = {
  all: ['leave'] as const,
  types: () => [...leaveKeys.all, 'types'] as const,
  balances: (employeeId?: string, year?: number) => [...leaveKeys.all, 'balances', employeeId, year] as const,
  requests: (params?: { employee_id?: string; status?: string; year?: number }) =>
    [...leaveKeys.all, 'requests', params] as const,
  stats: () => [...leaveKeys.all, 'stats'] as const,
}

export const leaveApi = {
  getTypes: async (): Promise<ILeaveType[]> => {
    const res = await api.get<{ success: boolean; data: ILeaveType[] }>('/leave/types')
    return res.data.data
  },

  getBalances: async (employeeId?: string, year?: number): Promise<ILeaveBalance[]> => {
    const res = await api.get<{ success: boolean; data: ILeaveBalance[] }>('/leave/balances', {
      params: { employee_id: employeeId, year },
    })
    return res.data.data
  },

  getRequests: async (params?: {
    employee_id?: string
    status?: string
    year?: number
    page?: number
    page_size?: number
  }): Promise<{ data: ILeaveRequest[]; total: number }> => {
    const res = await api.get<{ success: boolean; data: ILeaveRequest[]; total: number }>('/leave/requests', {
      params,
    })
    return { data: res.data.data, total: res.data.total }
  },

  submitRequest: async (payload: SubmitLeavePayload): Promise<ILeaveRequest> => {
    const res = await api.post<{ success: boolean; data: ILeaveRequest }>('/leave/requests', payload)
    return res.data.data
  },

  reviewRequest: async (id: string, payload: ReviewLeavePayload): Promise<ILeaveRequest> => {
    const res = await api.patch<{ success: boolean; data: ILeaveRequest }>(`/leave/requests/${id}/review`, payload)
    return res.data.data
  },

  getStats: async (): Promise<ILeaveStats> => {
    const res = await api.get<{ success: boolean; data: ILeaveStats }>('/leave/stats')
    return res.data.data
  },
}
