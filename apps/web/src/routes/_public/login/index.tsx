import { createFileRoute } from '@tanstack/react-router'
import { Sparkle } from '@phosphor-icons/react'
import { ThemeToggle } from '@hris/ui'
import { useLoginForm } from './_hooks/use-login-form'
import { LoginCard } from './_components/login-card'

export const Route = createFileRoute('/_public/login/')({
  component: LoginPage,
})

function LoginPage() {
  const { form, serverError } = useLoginForm()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground transition-colors duration-200">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle showLabel={false} />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-primary p-0.5 shadow-xl shadow-primary/25">
            <div className="h-full w-full bg-background rounded-[14px] flex items-center justify-center">
              <Sparkle className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">HRIS Platform</h1>
          <p className="text-sm text-muted-foreground">
            Deterministic Payroll & Intelligent Workforce Management
          </p>
        </div>

        {/* Login Card */}
        <LoginCard form={form} serverError={serverError} />
      </div>
    </div>
  )
}
