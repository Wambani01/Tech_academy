import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="bg-ink min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="font-display font-bold text-[clamp(64px,10vw,120px)] text-amber leading-none mb-2">
        404
      </div>
      <div className="font-display font-bold text-2xl text-cream mb-3">
        This page took a gap year.
      </div>
      <p className="text-body text-on-ink max-w-[400px] leading-[1.6] mb-8">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. Let&rsquo;s get you back
        on track.
      </p>
      <Link
        href="/"
        className="inline-block bg-amber text-ink px-7 py-[15px] rounded-md text-body font-bold"
      >
        Back to Homepage
      </Link>
    </div>
  )
}
