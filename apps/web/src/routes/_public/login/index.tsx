import { createFileRoute } from '@tanstack/react-router'
import { ThemeToggle } from '@hris/ui'
import { useLoginForm } from './_hooks/use-login-form'
import { LoginCard } from './_components/login-card'

export const Route = createFileRoute('/_public/login/')({
  component: LoginPage,
})

function LoginPage() {
  const { form, serverError } = useLoginForm()

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#5b45e0] dark:bg-[#0c0a1a] relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-90 dark:opacity-30">
        <svg
          className="w-full h-full object-cover min-w-300 min-h-225"
          preserveAspectRatio="none"
          viewBox="0 0 1440 900"
          fill="none"
        >
          <polygon points="0,0 750,0 480,480 0,320" fill="#6852ec" fillOpacity="0.8" />
          <polygon points="750,0 1440,0 1440,480 940,360" fill="#4d37d6" fillOpacity="0.6" />
          <polygon points="0,320 480,480 320,900 0,900" fill="#4a33d3" fillOpacity="0.7" />
          <polygon points="480,480 940,360 1440,480 1440,900 780,900" fill="#5e47e5" fillOpacity="0.5" />
          <polygon points="480,480 780,900 320,900" fill="#6c55ea" fillOpacity="0.4" />
          <polygon points="940,360 1440,480 1440,180" fill="#7660f2" fillOpacity="0.3" />
        </svg>
      </div>

      <div className="absolute top-6 right-6 z-30">
        <div className="rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10 p-1 shadow-lg">
          <ThemeToggle showLabel={false} />
        </div>
      </div>
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-[0_25px_70px_-15px_rgba(25,10,75,0.45)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] border border-white/40 dark:border-zinc-800 flex flex-col md:flex-row min-h-150 relative z-10 backdrop-blur-sm">
        <div className="hidden md:flex md:w-1/2 lg:w-[48%] relative overflow-hidden bg-slate-900 select-none">
          <img
            src="/images/auth-banner.jpg"
            alt="HRIS Modern Workplace"
            className="w-full h-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-950/10 to-transparent pointer-events-none" />
          <svg
            className="absolute -top-8 -left-8 w-44 h-44 text-white drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] z-20 pointer-events-none"
            viewBox="0 0 140 100"
            fill="currentColor"
          >
            <path d="M 0,70 L 70,0 L 140,70 L 112,98 L 70,56 L 28,98 Z" />
          </svg>

          <svg
            className="absolute top-1/2 left-[30%] w-36 h-36 text-white drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] z-20 pointer-events-none"
            viewBox="0 0 140 100"
            fill="currentColor"
          >
            <path d="M 0,28 L 70,98 L 140,28 L 112,0 L 70,42 L 28,0 Z" />
          </svg>
        </div>

        <div className="w-full md:w-1/2 lg:w-[52%] flex flex-col justify-center p-8 sm:p-12 lg:p-14 bg-white dark:bg-zinc-900">
          <LoginCard form={form} serverError={serverError} />
        </div>

      </div>
    </div>
  )
}
