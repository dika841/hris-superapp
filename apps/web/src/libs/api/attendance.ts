import { api } from './client'

export interface IAttendanceLog {
  id: string
  employee_id: string
  employee_name: string
  employee_code: string
  department: string
  date: string
  schedule_id?: string | null
  check_in?: string | null
  check_out?: string | null
  status: 'present' | 'late' | 'early_departure' | 'absent' | 'leave'
  late_duration_minutes: number
  overtime_minutes: number
  notes?: string | null
  auto_closed: boolean
}

export interface IWorkSchedule {
  id: string
  name: string
  start_time: string
  end_time: string
  late_tolerance_minutes: number
  is_default: boolean
}

export interface ITodayAttendance {
  date: string
  log?: IAttendanceLog | null
  schedule?: IWorkSchedule | null
  server_time_wib: string
}

export interface IAttendanceStats {
  date: string
  present_count: number
  late_count: number
  absent_count: number
  leave_count: number
  total_active_employees: number
  present_rate: string
  total_overtime_hours: string
}

export interface ListAttendanceParams {
  date?: string
  employee_id?: string
  status?: string
  page?: number
  page_size?: number
}

export interface ClockInPayload {
  employee_id?: string
  latitude?: number
  longitude?: number
  notes?: string
}

export interface ClockOutPayload {
  employee_id?: string
  latitude?: number
  longitude?: number
  notes?: string
}

export const attendanceKeys = {
  all: ['attendance'] as const,
  today: (employeeId?: string) => [...attendanceKeys.all, 'today', employeeId] as const,
  stats: (date?: string) => [...attendanceKeys.all, 'stats', date] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (params?: ListAttendanceParams) => [...attendanceKeys.lists(), params] as const,
}

export const attendanceApi = {
  getToday: async (employeeId?: string): Promise<ITodayAttendance> => {
    const res = await api.get<{ success: boolean; data: ITodayAttendance }>('/attendance/today', {
      params: employeeId ? { employee_id: employeeId } : undefined,
    })
    return res.data.data
  },

  getStats: async (date?: string): Promise<IAttendanceStats> => {
    const res = await api.get<{ success: boolean; data: IAttendanceStats }>('/attendance/stats', {
      params: date ? { date } : undefined,
    })
    return res.data.data
  },

  list: async (params?: ListAttendanceParams): Promise<{ data: IAttendanceLog[]; total: number }> => {
    const res = await api.get<{ success: boolean; data: IAttendanceLog[]; total: number }>('/attendance/logs', {
      params,
    })
    return { data: res.data.data, total: res.data.total }
  },

  clockIn: async (payload: ClockInPayload): Promise<IAttendanceLog> => {
    const res = await api.post<{ success: boolean; data: IAttendanceLog }>('/attendance/clock-in', payload)
    return res.data.data
  },

  clockOut: async (payload: ClockOutPayload): Promise<IAttendanceLog> => {
    const res = await api.post<{ success: boolean; data: IAttendanceLog }>('/attendance/clock-out', payload)
    return res.data.data
  },
}
