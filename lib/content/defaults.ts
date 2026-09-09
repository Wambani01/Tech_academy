import type { BlockKind } from '@/types/database'

/**
 * The prototypes' copy, as block payloads.
 *
 * These are the same values `supabase/seed.sql` inserts. They serve two
 * purposes: they are what a fresh database is seeded with, and they are the
 * fallback the public pages render when Supabase is not configured yet — so
 * the marketing site builds and previews before the database is provisioned.
 *
 * Once the CMS holds content, `getPageBlocks` returns the database rows and
 * these are never read.
 */

export type DefaultBlock = {
  position: number
  kind: BlockKind
  fields: Record<string, string>
  /** Cloudinary public_id. */
  image?: string
  imageAlt?: string
  /** Track cards carry one image each. */
  cardImages?: string[]
}

const CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_3HDwCEa8MqjLF91O1hO8lu9lW6v'

/**
 * The original CDN links, keyed by Cloudinary public_id.
 *
 * The assets now live in Cloudinary, so this map is only reached when
 * `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is unset — a checkout with no Cloudinary
 * configured still renders the marketing site rather than a wall of
 * placeholders. It is a development convenience, not a production path, and can
 * be deleted once every environment has the cloud name.
 */
export const ASSET_FALLBACK: Record<string, string> = {
  'tech-lab-academy/marketing/hero-classroom-daylight': `${CDN}/hf_20260819_120104_eb685a6e-a46c-43c2-988c-4e0ef3ed9ed8.png`,
  'tech-lab-academy/marketing/cohort-classroom': `${CDN}/hf_20260819_112551_1a6870e2-ed7b-40f2-a759-ac22c1608725.png`,
  'tech-lab-academy/courses/track-ai-marketing': `${CDN}/hf_20260819_112551_6d93d457-5655-4ca1-9a71-bdfaaefe6864.png`,
  'tech-lab-academy/courses/track-brand-design': `${CDN}/hf_20260819_112551_e00a2d7a-466e-48a2-a764-4a4284651011.png`,
  'tech-lab-academy/courses/track-development': `${CDN}/hf_20260819_112551_e3f0ef0b-e44b-43df-a219-07668153123d.png`,
  'tech-lab-academy/courses/track-automation': `${CDN}/hf_20260819_112551_60395cd8-8a23-4f63-bfbd-d1dbebd50b01.png`,
  'tech-lab-academy/marketing/business-team-training': `${CDN}/hf_20260819_112716_6eb46da8-8299-4a55-b979-dc121190f344.png`,
  'tech-lab-academy/marketing/campus-evening-study': `${CDN}/hf_20260819_112551_6d5d2ead-5230-4dd5-a732-58aeefa6b3fd.png`,
  'tech-lab-academy/marketing/campus-exterior': `${CDN}/hf_20260819_112551_5e81c8db-3e12-4d04-ae30-58911d8316e0.png`,
  'tech-lab-academy/people/instructor-sarah': `${CDN}/hf_20260819_112551_d130a887-25a7-4718-a237-c4fa6f1a693d.png`,
  'tech-lab-academy/people/instructor-tom': `${CDN}/hf_20260819_112551_3990c16b-0e8e-4181-8544-f80dc0164b76.png`,
  'tech-lab-academy/people/students-whiteboard': `${CDN}/hf_20260819_112551_b98187c2-b94e-446e-b723-3aa812768256.png`,
  'tech-lab-academy/courses/course-workspace': `${CDN}/hf_20260819_112551_1e918206-54a6-4df0-bc0f-65c7d5cbac43.png`,
}

/**
 * Resolve a Cloudinary public_id to something renderable without Cloudinary.
 * Returns null for anything uploaded since the migration — those ids have no
 * CDN twin, and a null is the signal to render the striped placeholder.
 */
export function assetFallback(publicId: string | null | undefined): string | null {
  if (!publicId) return null
  return ASSET_FALLBACK[publicId] ?? null
}

export const HOME_BLOCKS: DefaultBlock[] = [
  {
    position: 1,
    kind: 'hero',
    image: 'tech-lab-academy/marketing/hero-classroom-daylight',
    imageAlt: 'Sunlit classroom with students working at laptops',
    fields: {
      eyebrow: "East Africa's Practical Tech Academy",
      headline: 'Learn the skills that get you hired & paid.',
      sub: 'Cohort-based programs in marketing, design, development and AI tools — real projects, real feedback, real portfolio.',
      cta1: 'Browse Programs',
      cta2: 'For Teams',
    },
  },
  {
    position: 2,
    kind: 'stats',
    fields: {
      s1: '2,400+ · Trained',
      s2: '4.9★ · Avg rating',
      s3: '35+ · Programs',
      s4: '100% · Hands-on',
    },
  },
  {
    position: 3,
    kind: 'tracks',
    cardImages: [
      'tech-lab-academy/courses/track-ai-marketing',
      'tech-lab-academy/courses/track-brand-design',
      'tech-lab-academy/courses/track-development',
      'tech-lab-academy/courses/track-automation',
    ],
    fields: {
      title: 'Pick your track',
      t1: 'AI Marketing',
      b1: 'Campaigns, content & analytics with AI.',
      t2: 'Brand & Product Design',
      b2: 'Visual systems & AI creative flow.',
      t3: 'Web & App Development',
      b3: 'Modern stacks, AI pair-coding.',
      t4: 'No-Code Automation',
      b4: 'Internal tools, zero heavy code.',
    },
  },
  {
    position: 4,
    kind: 'steps',
    fields: {
      title: 'Five steps to a provable skill',
      step1: 'Enroll',
      step2: 'Learn by doing',
      step3: 'Apply it',
      step4: 'Get certified',
      step5: 'Keep growing',
    },
  },
  {
    position: 5,
    kind: 'proof',
    fields: {
      title: 'What graduates say',
      quote1:
        'I came in able to run ads and left able to explain why they worked. The campaign brief from week four got me the job.',
      attr1: 'Marketing cohort, 2026',
      quote2:
        'The assignments were real client work in disguise. My portfolio tripled in six weeks.',
      attr2: 'Design cohort, 2026',
      quote3:
        'Pair-coding with AI properly — not just autocomplete. I ship features I would have quoted a month for.',
      attr3: 'Development cohort, 2026',
    },
  },
  {
    position: 6,
    kind: 'faq',
    fields: {
      title: 'Questions people ask before enrolling',
      intro:
        'Everything about cohorts, payment and certificates. Still unsure? Talk to admissions.',
    },
  },
  {
    position: 7,
    kind: 'cta',
    fields: { title: 'For Individuals', btn: 'Browse All Courses' },
  },
  {
    position: 8,
    kind: 'meta',
    fields: {
      title: 'Tech Lab Academy — practical tech training in Nairobi',
      desc: 'Cohort-based programs in marketing, design, development and AI tools — real projects, real feedback, real portfolio.',
    },
  },
]

export const PAGE_DEFAULTS: Record<string, DefaultBlock[]> = {
  home: HOME_BLOCKS,
  about: [
    {
      position: 1,
      kind: 'hero',
      fields: {
        eyebrow: 'About Us',
        headline: 'We built the academy we wished existed.',
        sub: 'Most training teaches tools in isolation. We pair strategy with hands-on practice, so every graduate leaves with judgment, not just button-pushing skills — and a portfolio to prove it.',
        cta1: '',
        cta2: '',
      },
    },
    {
      position: 2,
      kind: 'stats',
      fields: {
        s1: '2019 · Founded',
        s2: '2,400+ · Graduates',
        s3: '35+ · Programs run',
        s4: '18 · Instructors',
      },
    },
    {
      position: 3,
      kind: 'meta',
      fields: {
        title: 'About Tech Lab Academy',
        desc: 'A small, senior team of instructors across marketing, design, development and automation.',
      },
    },
  ],
  business: [
    {
      position: 1,
      kind: 'hero',
      image: 'tech-lab-academy/marketing/business-team-training',
      imageAlt: 'A team in a private training session',
      fields: {
        eyebrow: 'For Teams & Organisations',
        headline: 'Upskill your whole team in AI-first ways of working.',
        sub: 'Structured, cohort-based training for marketing, design, dev and ops teams — built around your stack, your tools, and your timeline.',
        cta1: 'Book a Team Demo',
        cta2: '',
      },
    },
    {
      position: 2,
      kind: 'stats',
      fields: {
        s1: '3× · Speed',
        s2: '40+ · Orgs',
        s3: '4–12wk · Cohort',
        s4: '',
      },
    },
    {
      position: 3,
      kind: 'meta',
      fields: {
        title: 'Corporate training — Tech Lab Academy',
        desc: 'Custom cohorts for marketing, design, dev and ops teams, built around your stack and goals.',
      },
    },
  ],
  campus: [
    {
      position: 1,
      kind: 'hero',
      image: 'tech-lab-academy/marketing/campus-evening-study',
      imageAlt: 'Student studying at home in the evening',
      fields: {
        eyebrow: 'Digital Campus',
        headline: 'Learn anywhere, apply everywhere.',
        sub: 'Video lessons, templates and community from any device — with structured milestones so you actually finish.',
        cta1: 'Explore Campus',
        cta2: '',
      },
    },
    {
      position: 2,
      kind: 'meta',
      fields: {
        title: 'Digital Campus — Tech Lab Academy',
        desc: 'Video lessons, templates and community from any device, with structured milestones.',
      },
    },
  ],
  events: [
    {
      position: 1,
      kind: 'hero',
      fields: {
        eyebrow: 'Masterclasses & Events',
        headline: 'Live sessions with people doing the work right now.',
        sub: 'One-off masterclasses and short workshops — no long-term commitment, straight to the point.',
        cta1: '',
        cta2: '',
      },
    },
    {
      position: 2,
      kind: 'meta',
      fields: {
        title: 'Masterclasses & events — Tech Lab Academy',
        desc: 'One-off masterclasses and short workshops with practitioners.',
      },
    },
  ],
}
