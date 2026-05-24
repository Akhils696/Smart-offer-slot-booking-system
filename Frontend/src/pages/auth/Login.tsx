import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isReady, login } = useAuth()
  const { register, handleSubmit, formState, setValue } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? ROUTES.admin.dashboard

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (_, variables) => {
      toast.success(`Welcome back, ${variables.email}`)
      await navigate(from, { replace: true })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in.')
    },
  })

  const onSubmit = (values: LoginForm) => {
    loginMutation.mutate(values)
  }

  useEffect(() => {
    if (isReady && isAuthenticated) {
      void navigate(ROUTES.admin.dashboard, { replace: true })
    }
  }, [isAuthenticated, isReady, navigate])

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm">Access business offer and booking operations.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Email</span>
            <input
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              type="email"
              placeholder="e.g. admin@smartoffer.local"
              autoComplete="email"
              {...register('email')}
            />
            {formState.errors.email ? (
              <span className="mt-1 block text-xs text-red-600">{formState.errors.email.message}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Password</span>
            <input
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
            />
            {formState.errors.password ? (
              <span className="mt-1 block text-xs text-red-600">{formState.errors.password.message}</span>
            ) : null}
          </label>

          <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Signing in...' : 'Continue'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Don't have an account?{' '}
          <Link to={ROUTES.auth.register} className="font-semibold text-primary-600 hover:text-primary-700">
            Sign up
          </Link>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Demo Testing Accounts</p>
          <button
            type="button"
            onClick={() => {
              setValue('email', 'admin@smartoffer.local')
              setValue('password', 'Admin@12345')
            }}
            className="flex w-full items-center justify-between rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50"
          >
            <span>Platform Admin</span>
            <span className="font-semibold text-primary-600">Quick Fill</span>
          </button>
        </div>
      </section>
    </main>
  )
}
