import type { Metadata } from 'next'
import { PageTitle, StudentShell } from '@/components/student/student-shell'
import { SettingsPanels } from '@/components/student/settings-panels'
import { requireProfile } from '@/lib/student'

export const metadata: Metadata = { title: 'Settings', robots: { index: false } }

export default async function SettingsPage() {
  const profile = await requireProfile()

  return (
    <StudentShell active="/settings" user={{ fullName: profile.full_name, track: profile.track }}>
      <div className="max-w-[760px]">
        <PageTitle>Settings</PageTitle>
        <div className="h-7" />
        <SettingsPanels
          profile={{
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            avatar_id: profile.avatar_id,
          }}
        />
      </div>
    </StudentShell>
  )
}
