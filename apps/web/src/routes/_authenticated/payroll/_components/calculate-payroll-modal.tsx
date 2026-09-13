import { Calculator } from '@phosphor-icons/react'
import {
  Button,
  Input,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@hris/ui'
import type { AnyFieldApi } from '@tanstack/react-form'
import type { useCalculatePayrollForm } from '../_hooks/use-payroll-forms'

interface CalculatePayrollModalProps {
  isOpen: boolean
  onClose: () => void
  form: ReturnType<typeof useCalculatePayrollForm>
  employees: Array<{
    id: string
    full_name: string
    employee_code: string
    department: string
  }>
  selectedMonth: number
  selectedYear: number
  isPending: boolean
}

export function CalculatePayrollModal({
  isOpen,
  onClose,
  form,
  employees,
  selectedMonth,
  selectedYear,
  isPending,
}: CalculatePayrollModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Compute Employee Payroll
          </h2>
          <button
            onClick={() => {
              onClose()
              form.reset()
            }}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="employee_id"
            children={(field: AnyFieldApi) => (
              <FormItem>
                <FormLabel htmlFor={field.name} isRequired>
                  Select Employee
                </FormLabel>
                <FormControl>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.employee_code}) - {emp.department}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage errors={field.state.meta.errors} />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Period Month</FormLabel>
              <FormControl>
                <Input type="number" value={selectedMonth} disabled />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Period Year</FormLabel>
              <FormControl>
                <Input type="number" value={selectedYear} disabled />
              </FormControl>
            </FormItem>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="overtime_hours"
              children={(field: AnyFieldApi) => (
                <FormItem>
                  <FormLabel htmlFor={field.name} isRequired>
                    Overtime Hours (PP 35)
                  </FormLabel>
                  <FormControl>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormMessage errors={field.state.meta.errors} />
                </FormItem>
              )}
            />

            <form.Field
              name="bonus"
              children={(field: AnyFieldApi) => (
                <FormItem>
                  <FormLabel htmlFor={field.name} isRequired>
                    Additional Bonus (IDR)
                  </FormLabel>
                  <FormControl>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormMessage errors={field.state.meta.errors} />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose()
                form.reset()
              }}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || isPending}
                >
                  {isSubmitting || isPending
                    ? 'Calculating...'
                    : 'Run PMK 168 Calculation'}
                </Button>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  )
}
