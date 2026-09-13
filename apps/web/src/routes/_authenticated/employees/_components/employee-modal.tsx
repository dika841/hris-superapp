import { UserPlus } from '@phosphor-icons/react'
import {
  Button,
  Input,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@hris/ui'
import { useEmployeeForm } from '../_hooks/use-employee-form'
import type { TCreateEmployeePayload } from '../../../../libs/api/employees'

export interface EmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TCreateEmployeePayload) => Promise<void> | void
  isPending: boolean
}

export function EmployeeModal({ isOpen, onClose, onSubmit, isPending }: EmployeeModalProps) {
  const form = useEmployeeForm({
    onSubmit: async (data) => {
      await onSubmit(data)
      form.reset()
    },
  })

  if (!isOpen) return null

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Register New Employee
          </h2>
          <button
            onClick={handleClose}
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
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="employee_code"
              children={(field) => (
                <FormItem>
                  <FormLabel htmlFor={field.name} isRequired>
                    Employee Code
                  </FormLabel>
                  <FormControl>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage errors={field.state.meta.errors} />
                </FormItem>
              )}
            />
            <form.Field
              name="full_name"
              children={(field) => (
                <FormItem>
                  <FormLabel htmlFor={field.name} isRequired>
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Budi Santoso"
                    />
                  </FormControl>
                  <FormMessage errors={field.state.meta.errors} />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="national_id"
              children={(field) => (
                <FormItem>
                  <FormLabel htmlFor={field.name} isRequired>
                    National ID (NIK)
                  </FormLabel>
                  <FormControl>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="3171xxxxxxxxxxxx"
                    />
                  </FormControl>
                  <FormMessage errors={field.state.meta.errors} />
                </FormItem>
              )}
            />
            <form.Field
              name="ptkp_status"
              children={(field) => (
                <FormItem>
                  <FormLabel htmlFor={field.name} isRequired>
                    PTKP Status (PMK 168)
                  </FormLabel>
                  <FormControl>
                    <select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value as any)}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground"
                    >
                      <option value="TK/0">TK/0 (TER A)</option>
                      <option value="TK/1">TK/1 (TER A)</option>
                      <option value="TK/2">TK/2 (TER B)</option>
                      <option value="TK/3">TK/3 (TER B)</option>
                      <option value="K/0">K/0 (TER A)</option>
                      <option value="K/1">K/1 (TER B)</option>
                      <option value="K/2">K/2 (TER B)</option>
                      <option value="K/3">K/3 (TER C)</option>
                    </select>
                  </FormControl>
                  <FormMessage errors={field.state.meta.errors} />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="department"
              children={(field) => (
                <FormItem>
                  <FormLabel htmlFor={field.name} isRequired>
                    Department
                  </FormLabel>
                  <FormControl>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage errors={field.state.meta.errors} />
                </FormItem>
              )}
            />
            <form.Field
              name="position"
              children={(field) => (
                <FormItem>
                  <FormLabel htmlFor={field.name} isRequired>
                    Position
                  </FormLabel>
                  <FormControl>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage errors={field.state.meta.errors} />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="basic_salary"
              children={(field) => (
                <FormItem>
                  <FormLabel htmlFor={field.name} isRequired>
                    Basic Monthly Salary (IDR)
                  </FormLabel>
                  <FormControl>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage errors={field.state.meta.errors} />
                </FormItem>
              )}
            />
            <form.Field
              name="allowance_fixed"
              children={(field) => (
                <FormItem>
                  <FormLabel htmlFor={field.name} isRequired>
                    Fixed Allowance (IDR)
                  </FormLabel>
                  <FormControl>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage errors={field.state.meta.errors} />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="bank_name"
              children={(field) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>
                    Bank Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage errors={field.state.meta.errors} />
                </FormItem>
              )}
            />
            <form.Field
              name="bank_account"
              children={(field) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>
                    Bank Account No.
                  </FormLabel>
                  <FormControl>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
                  {isSubmitting || isPending ? 'Saving...' : 'Register Employee'}
                </Button>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  )
}
