import Link from 'next/link'
import { AdminShell } from '@/components/admin/admin-shell'
import { FaqManager, type FaqRow } from '@/components/admin/faq-manager'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'FAQs' }

export default async function ManageFaqsPage() {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const { data } = await supabase
    .from('faqs')
    .select('id, position, question, answer, category, is_live, updated_at')
    .order('position')

  const faqs: FaqRow[] = (data ?? []).map((f) => ({
    id: f.id,
    position: f.position,
    question: f.question,
    answer: f.answer,
    category: f.category,
    isLive: f.is_live,
    updatedAt: f.updated_at,
  }))

  return (
    <AdminShell active="/admin/content" user={{ fullName: admin.full_name }}>
      <div className="max-w-[1080px]">
        <Link href="/admin/content" className="text-meta text-muted mb-4 inline-block">
          ← Website content
        </Link>
        <FaqManager faqs={faqs} />
      </div>
    </AdminShell>
  )
}
