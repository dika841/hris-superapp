import * as React from 'react'
import {
  ArrowRightIcon,
  LockIcon,
  EnvelopeIcon,
  WarningCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Input,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@hris/ui'
import type { AnyFieldApi } from '@tanstack/react-form'
import type { useLoginForm } from '../_hooks/use-login-form'

interface LoginCardProps {
  form: ReturnType<typeof useLoginForm>['form']
  serverError: string | null
}

export function LoginCard({ form, serverError }: LoginCardProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [demoCopied, setDemoCopied] = React.useState(false)

  const handleQuickFill = () => {
    form.setFieldValue('email', 'admin@hris.local')
    form.setFieldValue('password', 'Admin123!')
    setDemoCopied(true)
    setTimeout(() => setDemoCopied(false), 2000)
  }

  return (
    <div className="w-full flex flex-col justify-between h-full">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                HRIS
              </span>
              <span className="font-semibold text-lg text-indigo-600 dark:text-indigo-400 tracking-tight">
                SuperApp
              </span>
            </div>
            <span className="text-[11px] font-medium tracking-wide text-slate-400 dark:text-slate-500 uppercase">
              Enterprise Workforce
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            Sign in to your account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your credentials to access the management portal
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4 pt-2"
        >
          {serverError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <WarningCircleIcon className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{serverError}</span>
            </div>
          )}

          <form.Field
            name="email"
            children={(field: AnyFieldApi) => (
              <FormItem className="space-y-1.5">
                <FormLabel
                  htmlFor={field.name}
                  className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase"
                >
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="admin@hris.local"
                      className="pl-10 h-11 bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 rounded-xl text-sm focus-visible:ring-indigo-500"
                    />
                  </div>
                </FormControl>
                <FormMessage errors={field.state.meta.errors} />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <form.Field
            name="password"
            children={(field: AnyFieldApi) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel
                    htmlFor={field.name}
                    className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase"
                  >
                    Password
                  </FormLabel>
                </div>
                <FormControl>
                  <div className="relative">
                    <LockIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? 'text' : 'password'}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 rounded-xl text-sm focus-visible:ring-indigo-500 font-mono tracking-tight"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage errors={field.state.meta.errors} />
              </FormItem>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="w-full h-11 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 active:scale-[0.99] transition-all"
                disabled={!canSubmit || isSubmitting}
                isLoading={isSubmitting}
              >
                {!isSubmitting && (
                  <>
                    <span>Sign In</span>
                    <ArrowRightIcon className="h-4 w-4 ml-1" weight="bold" />
                  </>
                )}
              </Button>
            )}
          />
        </form>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
              Demo Credentials
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              admin@hris.local / Admin123!
            </span>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 transition-colors"
          >
            {demoCopied ? (
              <>
                <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" weight="fill" />
                <span>Filled</span>
              </>
            ) : (
              <span>Quick Fill</span>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Need an account? Contact your HR Administrator
        </p>
      </div>
    </div>
  )
}
