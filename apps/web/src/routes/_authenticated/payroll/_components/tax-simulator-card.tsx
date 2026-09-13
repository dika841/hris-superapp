import { Sparkle, Calculator } from '@phosphor-icons/react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@hris/ui'
import { formatRupiah } from '@hris/utils'
import type { AnyFieldApi } from '@tanstack/react-form'
import type { useTaxSimulatorForm } from '../_hooks/use-payroll-forms'
import type { TTaxPreviewResponse } from '../../../../libs/api/payroll'

interface TaxSimulatorCardProps {
  form: ReturnType<typeof useTaxSimulatorForm>['form']
  simResult?: TTaxPreviewResponse
}

export function TaxSimulatorCard({ form, simResult }: TaxSimulatorCardProps) {
  return (
    <Card className="glass-panel border-primary/30 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Calculator className="h-48 w-48 text-primary" />
      </div>
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <Sparkle className="h-4 w-4" />
          Interactive PMK 168/2023 TER Simulator
        </div>
        <CardTitle>Real-Time Tax Deduction & Take-Home Pay Simulator</CardTitle>
        <CardDescription>
          Experiment with gross salary amounts and PTKP brackets to observe automatic TER A, B, or C slotting.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <form.Field
            name="gross_salary"
            children={(field: AnyFieldApi) => (
              <FormItem>
                <FormLabel htmlFor={field.name} isRequired>
                  Gross Monthly Salary (IDR)
                </FormLabel>
                <FormControl>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    placeholder="15000000"
                  />
                </FormControl>
                <FormMessage errors={field.state.meta.errors} />
              </FormItem>
            )}
          />

          <form.Field
            name="ptkp_status"
            children={(field: AnyFieldApi) => (
              <FormItem>
                <FormLabel htmlFor={field.name} isRequired>
                  PTKP Status
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

          <div className="space-y-1 bg-muted/50 p-4 rounded-xl border border-border">
            <div className="text-xs text-muted-foreground">TER Category & Rate</div>
            <div className="text-xl font-bold text-primary">
              {simResult?.ter_category || 'TER A'} ({(parseFloat(simResult?.ter_rate || '0') * 100).toFixed(2)}%)
            </div>
            <div className="text-[11px] text-muted-foreground">
              PPh 21: {formatRupiah(simResult?.pph21_monthly || '0')}
            </div>
          </div>

          <div className="space-y-1 bg-muted/50 p-4 rounded-xl border border-border">
            <div className="text-xs text-muted-foreground">Take-Home Pay (Simulated)</div>
            <div className="text-xl font-bold text-emerald-500">
              {formatRupiah(simResult?.estimated_take_home_pay || '0')}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Total Deductions: {formatRupiah(simResult?.total_deductions || '0')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
