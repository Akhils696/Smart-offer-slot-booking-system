import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['Customer', 'BusinessOwner']),
})

type RegisterForm = z.infer<typeof registerSchema>

export function Register() {
  const navigate = useNavigate()
  const { isAuthenticated, isReady, register } = useAuth()
  const { register: registerField, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'Customer',
    },
  })

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: async (_, variables) => {
      toast.success(`Account created! Welcome, ${variables.fullName}`)
      if (variables.role === 'BusinessOwner') {
        await navigate(ROUTES.admin.dashboard, { replace: true })
      } else {
        await navigate(ROUTES.public.home, { replace: true })
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to register account.')
    },
  })

  const onSubmit = (values: RegisterForm) => {
    registerMutation.mutate(values)
  }

  useEffect(() => {
    if (isReady && isAuthenticated) {
      navigate(ROUTES.public.home, { replace: true })
    }
  }, [isAuthenticated, isReady, navigate])

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-8 shadow-soft">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Create an Account</h1>
          <p className="mt-2 text-sm text-muted">Join Smart Offer to publish offers or book reservation slots.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Full Name</span>
            <input
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              type="text"
              placeholder="e.g. Aarav Mehta"
              {...registerField('fullName')}
            />
            {formState.errors.fullName ? (
              <span className="mt-1 block text-xs text-red-600">{formState.errors.fullName.message}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Email</span>
            <input
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              type="email"
              placeholder="e.g. customer@gmail.com"
              {...registerField('email')}
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
              {...registerField('password')}
            />
            {formState.errors.password ? (
              <span className="mt-1 block text-xs text-red-600">{formState.errors.password.message}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">I want to register as a</span>
            <select
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              {...registerField('role')}
            >
              <option value="Customer">Customer (View & Book Offers)</option>
              <option value="BusinessOwner">Business Owner (Publish & Manage Slots)</option>
            </select>
          </label>

          <Button className="w-full mt-2" type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Registering...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to={ROUTES.auth.login} className="font-semibold text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  )
}
