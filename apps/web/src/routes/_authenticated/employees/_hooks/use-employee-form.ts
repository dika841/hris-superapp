import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import type { TCreateEmployeePayload } from '../../../../libs/api/employees'

export const createEmployeeSchema = z.object({
  employee_code: z.string().min(3, 'Employee code must be at least 3 characters'),
  full_name: z.string().min(2, 'Full name is required'),
  national_id: z.string().length(16, 'NIK must be exactly 16 digits'),
  department: z.string().min(2, 'Department is required'),
  position: z.string().min(2, 'Position is required'),
  basic_salary: z.coerce.number().min(1000000, 'Basic salary must be at least Rp 1.000.000'),
  allowance_fixed: z.coerce.number().min(0, 'Fixed allowance cannot be negative'),
  ptkp_status: z.enum(['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3']),
  bank_name: z.string(),
  bank_account: z.string(),
})

export type TCreateEmployeeForm = z.infer<typeof createEmployeeSchema>

export interface UseEmployeeFormOptions {
  onSubmit: (data: TCreateEmployeePayload) => Promise<void> | void
}

export function useEmployeeForm({ onSubmit }: UseEmployeeFormOptions) {
  const form = useForm({
    defaultValues: {
      employee_code: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      full_name: '',
      national_id: '',
      department: 'Engineering',
      position: 'Senior Software Engineer',
      basic_salary: 18000000,
      allowance_fixed: 2000000,
      ptkp_status: 'TK/0' as TCreateEmployeeForm['ptkp_status'],
      bank_name: 'Bank Central Asia (BCA)',
      bank_account: '8730129841',
    } satisfies TCreateEmployeeForm,
    validators: {
      onChange: createEmployeeSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        employee_code: value.employee_code,
        full_name: value.full_name,
        national_id: value.national_id,
        department: value.department,
        position: value.position,
        basic_salary: value.basic_salary,
        allowance_fixed: value.allowance_fixed,
        ptkp_status: value.ptkp_status,
        bank_name: value.bank_name || '',
        bank_account: value.bank_account || '',
        employment_status: 'permanent',
        join_date: new Date().toISOString().split('T')[0],
      })
    },
  })

  return form
}
