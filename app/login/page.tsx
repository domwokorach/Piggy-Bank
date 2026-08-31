'use client'

import { redirect } from 'next/navigation'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    redirect('/personal')
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
