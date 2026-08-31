'use client'

import { type ChangeEvent, type FormEvent, useRef, useState } from 'react'
import { AlertCircle, Eye, EyeOff, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AvatarCircle } from '@/components/ui/avatar-circle'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import type { RegistrationDraft } from '@/types'

const emptyDraft: RegistrationDraft = {
  firstName: '',
  lastName: '',
  dob: '',
  mobile: '',
  email: '',
  username: '',
  password: '',
  avatarUrl: undefined,
}

export function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()

  const [draft, setDraft] = useState<RegistrationDraft>(emptyDraft)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const update = (field: keyof RegistrationDraft) => (e: ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [field]: e.target.value }))

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setDraft((d) => ({ ...d, avatarUrl: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setTimeout(() => {
      const result = register(draft, confirmPassword)
      setLoading(false)
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong.')
        return
      }
      router.push('/verify-pin')
    }, 600)
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Set up your Parent Account in a few steps.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-4">
          <AvatarCircle name={`${draft.firstName} ${draft.lastName}`} imageUrl={draft.avatarUrl} size="xl" />
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" />
              Upload avatar
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">Optional, JPG or PNG</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" value={draft.firstName} onChange={update('firstName')} className="h-11" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" value={draft.lastName} onChange={update('lastName')} className="h-11" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dob">Date of birth</Label>
          <Input id="dob" type="date" value={draft.dob} onChange={update('dob')} className="h-11" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mobile">Mobile number</Label>
          <Input id="mobile" type="tel" placeholder="+44 7700 900123" value={draft.mobile} onChange={update('mobile')} className="h-11" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={draft.email} onChange={update('email')} className="h-11" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="username">Username / display name</Label>
          <Input id="username" value={draft.username} onChange={update('username')} className="h-11" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={draft.password}
              onChange={update('password')}
              className="h-11 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-11"
            required
          />
        </div>

        <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit application'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </>
  )
}
