'use client'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { PinVerification } from '@/components/auth/PinVerification'

export default function VerifyPinPage() {
  return (
    <AuthLayout>
      <PinVerification />
    </AuthLayout>
  )
}
