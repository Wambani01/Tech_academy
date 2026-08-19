import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'

/** `/learn` has no screen of its own — jump to the most recent active course. */
export default async function LearnIndexPage() {
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data: enrolment } = await supabase
    .from('enrollments')
    .select('courses(slug)')
    .eq('profile_id', profile.id)
    .eq('status', 'active')
    .order('enrolled_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const slug = (enrolment?.courses as { slug: string } | null)?.slug
  if (!slug) redirect('/dashboard')

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .single()

  const { data: firstModule } = await supabase
    .from('modules')
    .select('lessons(id, position)')
    .eq('course_id', course!.id)
    .order('position')
    .limit(1)
    .maybeSingle()

  const lessons = (firstModule?.lessons ?? []) as Array<{ id: string; position: number }>
  const first = lessons.sort((a, b) => a.position - b.position)[0]

  redirect(first ? `/learn/${slug}/${first.id}` : '/dashboard')
}
