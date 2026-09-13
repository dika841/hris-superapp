import { ArrowRight, Lock, Envelope, WarningCircle } from '@phosphor-icons/react'
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  return (
    <Card className="border-border bg-card/90 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>Enter your credentials to access the workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          {serverError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <WarningCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form.Field
            name="email"
            children={(field: AnyFieldApi) => (
              <FormItem>
                <FormLabel htmlFor={field.name} isRequired>
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Envelope className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="admin@hris.local"
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage errors={field.state.meta.errors} />
              </FormItem>
            )}
          />

          <form.Field
            name="password"
            children={(field: AnyFieldApi) => (
              <FormItem>
                <FormLabel htmlFor={field.name} isRequired>
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage errors={field.state.meta.errors} />
              </FormItem>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          />
        </form>

        <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
          Default Credentials: <code className="text-primary font-mono font-medium">admin@hris.local</code> / <code className="text-primary font-mono font-medium">Admin123!</code>
        </div>
      </CardContent>
    </Card>
  )
}
