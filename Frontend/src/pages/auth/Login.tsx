import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/Button'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (values: LoginForm) => {
    console.info('Login form ready for API integration', values.email)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm">Access business offer and booking operations.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-sm font-medium text-ink">Email</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-border px-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              type="email"
              autoComplete="email"
              {...register('email')}
            />
            {formState.errors.email ? (
              <span className="mt-1 block text-sm text-red-600">{formState.errors.email.message}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">Password</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-border px-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {formState.errors.password ? (
              <span className="mt-1 block text-sm text-red-600">{formState.errors.password.message}</span>
            ) : null}
          </label>

          <Button className="w-full" type="submit">
            Continue
          </Button>
        </form>
      </section>
    </main>
  )
}
