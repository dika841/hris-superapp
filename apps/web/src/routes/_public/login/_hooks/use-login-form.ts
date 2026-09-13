import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { authApi } from '../../../../libs/api/auth'
import { setAuthSession } from '../../../../libs/store/auth.store'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type TLoginForm = z.infer<typeof loginSchema>

export function useLoginForm() {
  const navigate = useNavigate()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: 'admin@hris.local',
      password: 'Admin123!',
    } satisfies TLoginForm,
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      try {
        const authData = await authApi.login({
          email: value.email,
          password: value.password,
        })
        setAuthSession(authData.access_token, authData.user)
        navigate({ to: '/' })
      } catch (err: any) {
        setServerError(err.response?.data?.error || 'Invalid credentials or server offline')
      }
    },
  })

  return { form, serverError }
}
