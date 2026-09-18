import { Calculator } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Combobox,
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
  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: `${emp.full_name} (${emp.employee_code}) - ${emp.department}`,
  }))

  const handleClose = () => {
    onClose()
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg space-y-5">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <DialogTitle>Compute Employee Payroll</DialogTitle>
          </div>
          <DialogDescription>
            Calculate payroll for an individual employee according to PMK 168/2023.
          </DialogDescription>
        </DialogHeader>

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
                  <Combobox
                    options={employeeOptions}
                    value={field.state.value}
                    onChange={(val) => field.handleChange(val)}
                    placeholder="-- Choose Employee --"
                    searchPlaceholder="Search employee name or code..."
                  />
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

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
