import { api } from './client'

export interface IPayrollRecord {
  id: string
  employee_id: string
  period_month: number
  period_year: number
  basic_salary: string
  allowance_fixed: string
  overtime_hours: string
  overtime_pay: string
  bonus: string
  gross_salary: string
  ter_category: string
  ter_rate: string
  pph21_amount: string
  bpjs_jht_employee: string
  bpjs_jp_employee: string
  bpjs_kes_employee: string
  total_deductions: string
  take_home_pay: string
  is_paid: boolean
  paid_at?: string | null
  created_at: string
}

export interface TCalculatePayrollPayload {
  employee_id: string
  period_month: number
  period_year: number
  overtime_hours?: number
  bonus?: number
}

export interface TTaxPreviewPayload {
  gross_salary: number
  ptkp_status: string
}

export interface TTaxPreviewResponse {
  gross_salary: string
  ptkp_status: string
  ter_category: string
  ter_rate: string
  pph21_monthly: string
  bpjs_jht_employee: string
  bpjs_jp_employee: string
  bpjs_kes_employee: string
  total_deductions: string
  estimated_take_home_pay: string
}

// Query Key Factory (Rule 1 & Section 3.8)
export const payrollKeys = {
  all: ['payroll'] as const,
  lists: () => [...payrollKeys.all, 'list'] as const,
  list: (params?: { month?: number; year?: number }) => [...payrollKeys.lists(), params] as const,
}

export const payrollApi = {
  list: async (month: number, year: number): Promise<IPayrollRecord[]> => {
    const res = await api.get<IPayrollRecord[]>('/payroll', { params: { month, year } })
    return res.data
  },
  calculate: async (payload: TCalculatePayrollPayload): Promise<IPayrollRecord> => {
    const res = await api.post<IPayrollRecord>('/payroll/calculate', payload)
    return res.data
  },
  markPaid: async (id: string): Promise<IPayrollRecord> => {
    const res = await api.patch<IPayrollRecord>(`/payroll/${id}/pay`)
    return res.data
  },
  previewTax: async (payload: TTaxPreviewPayload): Promise<TTaxPreviewResponse> => {
    const res = await api.post<TTaxPreviewResponse>('/payroll/preview-tax', payload)
    return res.data
  },
}
