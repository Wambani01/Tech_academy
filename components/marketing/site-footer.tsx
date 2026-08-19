import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-ink text-on-ink pt-14 pb-8 border-t border-[rgba(244,251,232,.08)]">
      <div className="container-site">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 mb-10 max-stack:grid-cols-2 max-stack:gap-7 max-[560px]:grid-cols-1">
          <div>
            <div className="font-display font-bold text-lg text-cream mb-3">TECH LAB ACADEMY</div>
            <div className="text-meta leading-[1.6] max-w-[280px]">
              Practical marketing, design and development training for professionals and teams
              across East Africa.
            </div>
          </div>
          <div>
            <div className="text-meta font-bold text-cream mb-3">Programs</div>
            <div className="text-meta leading-[2.1] flex flex-col">
              <Link href="/courses" className="hover:text-cream">
                Courses
              </Link>
              <Link href="/campus" className="hover:text-cream">
                Digital Campus
              </Link>
              <Link href="/events" className="hover:text-cream">
                Masterclasses
              </Link>
            </div>
          </div>
          <div>
            <div className="text-meta font-bold text-cream mb-3">Company</div>
            <div className="text-meta leading-[2.1] flex flex-col">
              <Link href="/about" className="hover:text-cream">
                About Us
              </Link>
              <Link href="/business" className="hover:text-cream">
                For Business
              </Link>
              <a href="mailto:hello@techlabacademy.co" className="hover:text-cream">
                Contact
              </a>
            </div>
          </div>
          <div>
            <div className="text-meta font-bold text-cream mb-3">Contact</div>
            <div className="text-meta leading-[2.1]">
              hello@techlabacademy.co
              <br />
              Nairobi, Kenya
            </div>
          </div>
        </div>
        <div className="border-t border-line-on-ink pt-5 text-pill text-on-ink-4">
          © {new Date().getFullYear()} Tech Lab Academy. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
