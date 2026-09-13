import { useForm, useStore } from '@tanstack/react-form'
import { z } from 'zod'

export const taxSimulatorSchema = z.object({
  gross_salary: z.coerce.number().min(0, 'Gross salary must be positive'),
  ptkp_status: z.enum(['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3']),
})

export type TTaxSimulatorForm = z.infer<typeof taxSimulatorSchema>

export const calculatePayrollSchema = z.object({
  employee_id: z.string().min(1, 'Please select an employee'),
  overtime_hours: z.coerce.number().min(0, 'Overtime hours cannot be negative'),
  bonus: z.coerce.number().min(0, 'Bonus cannot be negative'),
})

export type TCalculatePayrollForm = z.infer<typeof calculatePayrollSchema>

export function useTaxSimulatorForm() {
  const form = useForm({
    defaultValues: {
      gross_salary: 15000000,
      ptkp_status: 'TK/0' as TTaxSimulatorForm['ptkp_status'],
    } satisfies TTaxSimulatorForm,
    validators: {
      onChange: taxSimulatorSchema,
    },
  })

  const values = useStore(form.store, (state) => state.values)

  return { form, values }
}

export function useCalculatePayrollForm(
  onSubmit: (data: TCalculatePayrollForm) => Promise<void> | void
) {
  const form = useForm({
    defaultValues: {
      employee_id: '',
      overtime_hours: 0,
      bonus: 0,
    } satisfies TCalculatePayrollForm,
    validators: {
      onChange: calculatePayrollSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
      form.reset()
    },
  })

  return form
}
