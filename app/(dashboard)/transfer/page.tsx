'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { TransferForm } from '@/components/banking/TransferForm'

function TransferPageContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') === 'payment' ? 'quick' : 'full'
  const direction = searchParams.get('direction') === 'kidToParent' ? 'kidToParent' : 'parentToKid'
  const kidId = searchParams.get('kidId') ?? undefined

  return (
    <div className="space-y-6">
      <PageHeader
        title={mode === 'quick' ? 'Payments' : 'Transfer'}
        subtitle={mode === 'quick' ? 'Send money to a kid account' : 'Move money within your family accounts'}
      />
      <TransferForm mode={mode} initialDirection={direction} initialKidId={kidId} />
    </div>
  )
}

export default function TransferPage() {
  return (
    <Suspense fallback={null}>
      <TransferPageContent />
    </Suspense>
  )
}
