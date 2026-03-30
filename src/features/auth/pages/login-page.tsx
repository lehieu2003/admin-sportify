import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../../../core/auth/use-auth'
import { Button } from '../../../core/ui/button'
import { Card } from '../../../core/ui/card'
import { Input } from '../../../core/ui/input'
import { env } from '../../../core/config/env'
import { toApiError } from '../../../core/network/api-error'

const loginSchema = z.object({
  email: z.string().email('Email is invalid'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { signin, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (field === 'email' || field === 'password') {
          setError(field, { message: issue.message })
        }
      })
      return
    }

    try {
      await signin(parsed.data)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from || '/', { replace: true })
    } catch (error) {
      setSubmitError(toApiError(error).message)
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-semibold text-white">{env.appName}</h1>
        <p className="mt-1 text-sm text-muted">Sign in with your admin account.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-muted" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          {submitError ? <p className="text-sm text-danger">{submitError}</p> : null}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted">
          API base URL: <span className="font-medium text-white">{env.apiBaseUrl}</span>
        </p>
        <Link to="/forbidden" className="mt-2 inline-block text-xs text-muted hover:text-white">
          Role test page
        </Link>
      </Card>
    </div>
  )
}
