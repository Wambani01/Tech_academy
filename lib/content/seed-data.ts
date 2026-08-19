import type { Course, EventRow, Faq, Instructor } from '@/types/database'

/**
 * The prototypes' catalogue, events, FAQ and instructor data.
 *
 * Mirrors `supabase/seed.sql`. Used as the fallback when Supabase is not
 * configured, so the public site renders identically to the mockups before the
 * database is provisioned.
 */

type SeedCourse = Pick<
  Course,
  'slug' | 'title' | 'track' | 'level' | 'blurb' | 'duration' | 'price_kes' | 'status'
> & { hero_id?: string; description?: string }

export const SEED_COURSES: SeedCourse[] = [
  {
    slug: 'ai-powered-content-campaigns',
    title: 'AI-Powered Content & Campaigns',
    track: 'Marketing',
    level: 'Beginner',
    blurb: 'Plan, write and automate content and ad campaigns using modern AI tools.',
    description:
      'Plan, write and automate content and ad campaigns using modern AI tools — from strategy to a working campaign brief.',
    duration: '6 weeks · Cohort',
    price_kes: 15000,
    status: 'published',
    hero_id: 'courses/course-workspace',
  },
  {
    slug: 'performance-marketing-analytics',
    title: 'Performance Marketing & Analytics',
    track: 'Marketing',
    level: 'Intermediate',
    blurb: 'Run paid campaigns and read the data that actually moves budget decisions.',
    duration: '8 weeks · Cohort',
    price_kes: 18000,
    status: 'published',
  },
  {
    slug: 'brand-visual-systems',
    title: 'Brand & Visual Systems',
    track: 'Design',
    level: 'Beginner',
    blurb: 'Build cohesive brand identities and design systems from scratch.',
    duration: '6 weeks · Cohort',
    price_kes: 15000,
    status: 'published',
  },
  {
    slug: 'product-design-with-ai',
    title: 'Product Design with AI Tools',
    track: 'Design',
    level: 'Intermediate',
    blurb: 'Wireframe, prototype and ship UX using AI-assisted design workflows.',
    duration: '8 weeks · Cohort',
    price_kes: 18000,
    status: 'draft',
  },
  {
    slug: 'web-development-foundations',
    title: 'Web Development Foundations',
    track: 'Development',
    level: 'Beginner',
    blurb: 'HTML, CSS and JavaScript fundamentals, built the modern way.',
    duration: '10 weeks · Cohort',
    price_kes: 22000,
    status: 'published',
  },
  {
    slug: 'ai-assisted-app-development',
    title: 'AI-Assisted App Development',
    track: 'Development',
    level: 'Advanced',
    blurb: 'Ship full-stack apps faster with AI pair-programming tools.',
    duration: '10 weeks · Cohort',
    price_kes: 25000,
    status: 'published',
  },
  {
    slug: 'no-code-workflow-automation',
    title: 'No-Code Workflow Automation',
    track: 'Automation',
    level: 'Beginner',
    blurb: 'Automate repetitive work and connect tools without writing code.',
    duration: '4 weeks · Cohort',
    price_kes: 12000,
    status: 'published',
  },
  {
    slug: 'internal-tools-for-ops',
    title: 'Internal Tools for Ops Teams',
    track: 'Automation',
    level: 'Intermediate',
    blurb: 'Build lightweight internal tools that replace spreadsheets and email.',
    duration: '6 weeks · Cohort',
    price_kes: 15000,
    status: 'draft',
  },
]

/** The curriculum shown on the course detail page. */
export const SEED_CURRICULUM: Record<string, Array<{ title: string; duration: string }>> = {
  'ai-powered-content-campaigns': [
    { title: 'Why AI + Strategy Beats Tools Alone', duration: '45 min' },
    { title: 'Building Your Content Calendar', duration: '1h 10m' },
    { title: 'AI Drafting Without Losing Your Voice', duration: '55 min' },
    { title: 'Campaign Brief: Product Launch', duration: '1h 30m' },
    { title: 'Measuring What Matters', duration: '50 min' },
    { title: 'Scaling Your Workflow', duration: '40 min' },
  ],
}

export const SEED_OUTCOMES: Record<string, string[]> = {
  'ai-powered-content-campaigns': [
    'Build a repeatable content calendar with AI drafting tools',
    'Automate ad copy variants and performance tracking',
    'Read campaign analytics well enough to shift budget confidently',
    'Ship a real campaign brief you can show clients or employers',
  ],
}

type SeedEvent = Pick<
  EventRow,
  'slug' | 'title' | 'track' | 'format' | 'starts_at' | 'capacity' | 'description' | 'status'
>

export const SEED_EVENTS: SeedEvent[] = [
  {
    slug: 'ai-campaign-automation-90',
    title: 'AI Campaign Automation in 90 Minutes',
    track: 'Marketing',
    format: 'Online, Live',
    starts_at: '2026-07-14T18:00:00+03:00',
    capacity: 300,
    description: 'A hands-on session on automating campaign workflows with AI.',
    status: 'past',
  },
  {
    slug: 'brand-system-with-ai',
    title: 'Building a Brand System with AI Tools',
    track: 'Design',
    format: 'Online, Live',
    starts_at: '2026-07-28T17:00:00+03:00',
    capacity: 250,
    description: 'From moodboard to type scale in one sitting.',
    status: 'past',
  },
  {
    slug: 'shipping-faster-ai-coding',
    title: 'Shipping Faster with AI Pair-Coding',
    track: 'Development',
    format: 'Online, Live',
    starts_at: '2026-08-09T18:00:00+03:00',
    capacity: 200,
    description: 'Live build: an app in ninety minutes.',
    status: 'past',
  },
  {
    slug: 'no-code-small-teams',
    title: 'No-Code Tools for Small Teams',
    track: 'Automation',
    format: 'Hybrid',
    starts_at: '2026-08-21T17:30:00+03:00',
    capacity: 150,
    description: 'Replace three spreadsheets with one workflow.',
    status: 'past',
  },
  {
    slug: 'portfolio-reviews-live-q4',
    title: 'Portfolio Reviews Live',
    track: 'Design',
    format: 'Online, Live',
    starts_at: '2026-09-24T18:00:00+03:00',
    capacity: 180,
    description: 'Bring work in progress; leave with notes.',
    status: 'upcoming',
  },
  {
    slug: 'content-strategy-2027',
    title: 'Content Strategy for 2027',
    track: 'Marketing',
    format: 'Online, Live',
    starts_at: '2026-10-08T18:00:00+03:00',
    capacity: 300,
    description: 'What is changing in search and social next year.',
    status: 'upcoming',
  },
]

type SeedFaq = Pick<Faq, 'position' | 'question' | 'answer' | 'category' | 'is_live'>

export const SEED_FAQS: SeedFaq[] = [
  {
    position: 1,
    question: 'Do I need any experience to start?',
    answer:
      'No. Every track has a beginner cohort that starts from first principles. If you already work in the field, the intermediate and advanced cohorts skip the basics.',
    category: 'Programs',
    is_live: true,
  },
  {
    position: 2,
    question: 'How much time should I set aside each week?',
    answer:
      'Plan for six to eight hours: two live sessions plus project work you can schedule around a job.',
    category: 'Programs',
    is_live: true,
  },
  {
    position: 3,
    question: 'Can I pay in instalments?',
    answer:
      'Yes. Cohort fees can be split across the length of the programme, paid by M-Pesa, card or bank transfer. Ask admissions before you enrol.',
    category: 'Payments',
    is_live: true,
  },
  {
    position: 4,
    question: 'What is your refund policy?',
    answer:
      'Full refund up to seven days before your cohort starts, and a pro-rata refund in the first two weeks.',
    category: 'Payments',
    is_live: true,
  },
  {
    position: 5,
    question: 'Do I get a certificate?',
    answer:
      'Every completed programme issues a verifiable certificate with a public link you can add to LinkedIn or a CV.',
    category: 'Certificates',
    is_live: true,
  },
  {
    position: 6,
    question: 'How long do I keep access to the material?',
    answer:
      'Lifetime access to lesson recordings, templates and resources for any programme you complete.',
    category: 'Campus',
    is_live: true,
  },
  {
    position: 7,
    question: 'Are sessions online or in person?',
    answer:
      'Most cohorts run online with live sessions. Selected programmes add optional in-person studio days in Nairobi.',
    category: 'Campus',
    is_live: true,
  },
  {
    position: 8,
    question: 'Do you help with job placement?',
    answer:
      'We run portfolio reviews and introduce strong graduates to hiring partners, but we do not guarantee placement.',
    category: 'Programs',
    is_live: false,
  },
]

type SeedInstructor = Pick<
  Instructor,
  'full_name' | 'email' | 'track' | 'role_title' | 'bio' | 'position'
> & { photo_id?: string }

export const SEED_INSTRUCTORS: SeedInstructor[] = [
  {
    full_name: 'Sarah Kamau',
    email: 'sarah.kamau@techlabacademy.co',
    track: 'Marketing',
    role_title: 'Lead Instructor',
    bio: '10+ years in growth and performance marketing across East Africa.',
    position: 1,
    photo_id: 'people/instructor-sarah',
  },
  {
    full_name: 'Tom Odhiambo',
    email: 'tom.odhiambo@techlabacademy.co',
    track: 'Design',
    role_title: 'Lead Instructor',
    bio: 'Brand and product designer; formerly in-house at two Nairobi studios.',
    position: 2,
    photo_id: 'people/instructor-tom',
  },
  {
    full_name: 'Linda Nyambura',
    email: 'linda.n@techlabacademy.co',
    track: 'Development',
    role_title: 'Lead Instructor',
    bio: 'Full-stack engineer teaching the fundamentals the modern way.',
    position: 3,
    photo_id: 'people/students-whiteboard',
  },
  {
    full_name: 'Eric Mutua',
    email: 'eric.mutua@techlabacademy.co',
    track: 'Automation',
    role_title: 'Lead Instructor',
    bio: 'Builds internal tools and automations for ops teams.',
    position: 4,
    photo_id: 'marketing/campus-exterior',
  },
  {
    full_name: 'Rita Njeri',
    email: 'rita.njeri@techlabacademy.co',
    track: 'Marketing',
    role_title: 'Guest Instructor',
    bio: 'Performance marketer specialising in paid social.',
    position: 5,
  },
  {
    full_name: 'Mercy Wanjiru',
    email: 'mercy.w@techlabacademy.co',
    track: 'Design',
    role_title: 'Guest Instructor',
    bio: 'Visual systems designer and illustrator.',
    position: 6,
  },
]

export const TRACKS = ['Marketing', 'Design', 'Development', 'Automation'] as const
