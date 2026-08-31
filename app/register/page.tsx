'use client'

import { redirect } from 'next/navigation'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    redirect('/personal')
  }

  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}
