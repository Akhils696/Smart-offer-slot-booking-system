import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
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
    <main className="grid min-h-screen bg-canvas px-4 py-8 lg:grid-cols-[1fr_480px] lg:px-8">
      <section className="hidden animate-fade-up rounded-2xl border border-primary-900 bg-primary-900 p-10 text-white shadow-lift lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-800 shadow-sm">
            <CalendarCheck size={22} />
          </div>
          <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight text-white">
            Operate bookings, offers, and slot capacity from one focused workspace.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-primary-100">
            Smart Offer keeps the admin surface tight: publish offers, watch reservations, and protect availability without spreadsheet work.
          </p>
        </div>

        <div className="grid gap-3">
          {[
            { icon: ShieldCheck, label: 'Protected admin routes' },
            { icon: Sparkles, label: 'Real-time booking feedback' },
            { icon: CalendarCheck, label: 'Slot-aware operations' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/8 p-4">
              <item.icon size={18} className="text-primary-100" />
              <span className="text-sm font-medium text-white">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-md animate-fade-up flex-col justify-center lg:mx-0 lg:ml-auto">
        <div className="rounded-xl border border-border bg-white p-7 shadow-soft sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">Admin access</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Sign in</h2>
            <p className="mt-2 text-sm">Access business offer and booking operations.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Email</span>
              <span className="relative mt-1.5 block">
                <Mail size={15} className="absolute left-3 top-3 text-muted" />
                <input
                  className="h-10 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  type="email"
                  placeholder="e.g. admin@smartoffer.local"
                  autoComplete="email"
                  {...register('email')}
                />
              </span>
              {formState.errors.email ? (
                <span className="mt-1 block text-xs text-red-600">{formState.errors.email.message}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Password</span>
              <span className="relative mt-1.5 block">
                <LockKeyhole size={15} className="absolute left-3 top-3 text-muted" />
                <input
                  className="h-10 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                />
              </span>
              {formState.errors.password ? (
                <span className="mt-1 block text-xs text-red-600">{formState.errors.password.message}</span>
              ) : null}
            </label>

            <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in...' : 'Continue'}
              {!loginMutation.isPending ? <ArrowRight size={16} /> : null}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            Don't have an account?{' '}
            <Link to={ROUTES.auth.register} className="font-semibold text-primary-600 hover:text-primary-700">
              Sign up
            </Link>
          </div>

          <div className="mt-6 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Demo testing account</p>
            <button
              type="button"
              onClick={() => {
                setValue('email', 'admin@smartoffer.local')
                setValue('password', 'Admin@12345')
              }}
              className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-50"
            >
              <span>Platform Admin</span>
              <span className="font-semibold text-primary-600">Quick fill</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
