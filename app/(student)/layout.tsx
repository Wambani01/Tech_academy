/**
 * Every student screen reads the session, so none of them may be statically
 * prerendered. Without this the build can bake in the signed-out redirect when
 * Supabase env is absent at build time.
 */
export const dynamic = 'force-dynamic'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return children
}
