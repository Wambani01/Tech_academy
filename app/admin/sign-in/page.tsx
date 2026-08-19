import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { AdminSignInForm } from '@/components/auth/admin-sign-in-form'

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false } }

export default function AdminSignInPage() {
  return (
    <AuthShell eyebrow="Staff Console">
      <Suspense>
        <AdminSignInForm />
      </Suspense>
    </AuthShell>
  )
}
