import { z } from 'zod'
import type { BlockKind, Json, PageBlock } from '@/types/database'

/**
 * CMS block registry — the single source of truth.
 *
 * One entry per block kind giving a Zod schema, a label, a hint and its image
 * slot. The admin editor renders its form *from the schema*; nothing is
 * hand-built per block. Adding a kind means adding one entry here, one
 * component in `components/marketing/blocks.tsx`, and a migration extending the
 * `block_kind` enum.
 *
 * The renderers live separately so this module stays importable from both
 * server and client components.
 */

/** How a field is presented in the generated admin form. */
export type FieldControl = 'text' | 'textarea'

export interface FieldDef {
  name: string
  label: string
  max: number
  control: FieldControl
  /** Repeated card fields group under one heading in the editor. */
  group?: string
}

export interface BlockDef {
  label: string
  hint: string
  image?: { label: string; required: boolean; perCard?: number }
  fields: FieldDef[]
  schema: z.ZodType<Record<string, string>>
}

const text = (name: string, label: string, max: number, group?: string): FieldDef => ({
  name,
  label,
  max,
  control: 'text',
  group,
})

const area = (name: string, label: string, max: number, group?: string): FieldDef => ({
  name,
  label,
  max,
  control: 'textarea',
  group,
})

/** Build a Zod object from the field list so the max lengths have one home. */
function schemaFor(fields: FieldDef[]) {
  return z.object(
    Object.fromEntries(
      fields.map((f) => [f.name, z.string().max(f.max, `Keep this under ${f.max} characters.`)])
    )
  ) as unknown as z.ZodType<Record<string, string>>
}

const heroFields = [
  text('eyebrow', 'Eyebrow', 40),
  text('headline', 'Headline', 60),
  area('sub', 'Sub-headline', 160),
  text('cta1', 'Primary button', 24),
  text('cta2', 'Secondary button', 24),
]

const statsFields = [
  text('s1', 'Stat 1', 12),
  text('s2', 'Stat 2', 12),
  text('s3', 'Stat 3', 12),
  text('s4', 'Stat 4', 12),
]

const tracksFields = [
  text('title', 'Section title', 40),
  text('t1', 'Card 1 title', 32, 'Card 1'),
  area('b1', 'Card 1 blurb', 90, 'Card 1'),
  text('t2', 'Card 2 title', 32, 'Card 2'),
  area('b2', 'Card 2 blurb', 90, 'Card 2'),
  text('t3', 'Card 3 title', 32, 'Card 3'),
  area('b3', 'Card 3 blurb', 90, 'Card 3'),
  text('t4', 'Card 4 title', 32, 'Card 4'),
  area('b4', 'Card 4 blurb', 90, 'Card 4'),
]

const stepsFields = [
  text('title', 'Section title', 48),
  text('step1', 'Step 01', 40),
  text('step2', 'Step 02', 40),
  text('step3', 'Step 03', 40),
  text('step4', 'Step 04', 40),
  text('step5', 'Step 05', 40),
]

const proofFields = [
  text('title', 'Section title', 48),
  area('quote1', 'Quote 1', 200, 'Testimonial 1'),
  text('attr1', 'Attribution 1', 40, 'Testimonial 1'),
  area('quote2', 'Quote 2', 200, 'Testimonial 2'),
  text('attr2', 'Attribution 2', 40, 'Testimonial 2'),
  area('quote3', 'Quote 3', 200, 'Testimonial 3'),
  text('attr3', 'Attribution 3', 40, 'Testimonial 3'),
]

const faqFields = [text('title', 'Section title', 48), area('intro', 'Intro', 120)]

const ctaFields = [text('title', 'Title', 60), text('btn', 'Button label', 24)]

const metaFields = [text('title', 'Page title', 60), area('desc', 'Meta description', 160)]

export const blockRegistry: Record<BlockKind, BlockDef> = {
  hero: {
    label: 'Hero',
    hint: 'The first thing visitors see. Keep the headline under 60 characters.',
    image: { label: 'Background image', required: true },
    fields: heroFields,
    schema: schemaFor(heroFields),
  },
  stats: {
    label: 'Stat bar',
    hint: 'Each value is “figure · label” — for example “2,400+ · Trained”.',
    fields: statsFields,
    schema: schemaFor(statsFields),
  },
  tracks: {
    label: 'Track cards',
    hint: 'Four cards, each linking to the matching track in the catalogue.',
    image: { label: 'Card image', required: false, perCard: 4 },
    fields: tracksFields,
    schema: schemaFor(tracksFields),
  },
  steps: {
    label: 'How it works',
    hint: 'Five numbered steps, 01–05, with amber numerals.',
    fields: stepsFields,
    schema: schemaFor(stepsFields),
  },
  proof: {
    label: 'Testimonials',
    hint: 'Three quotes with attribution.',
    fields: proofFields,
    schema: schemaFor(proofFields),
  },
  faq: {
    label: 'FAQ',
    hint: 'Only the heading and intro live here. The questions come from the FAQ manager.',
    fields: faqFields,
    schema: schemaFor(faqFields),
  },
  cta: {
    label: 'Closing CTA',
    hint: 'The last thing on the page before the footer.',
    fields: ctaFields,
    schema: schemaFor(ctaFields),
  },
  meta: {
    label: 'SEO',
    hint: 'Feeds the page <title> and meta description. Not visible on the page.',
    fields: metaFields,
    schema: schemaFor(metaFields),
  },
}

export const blockKinds = Object.keys(blockRegistry) as BlockKind[]

/** Public reads use `fields`; the admin preview uses `draft_fields ?? fields`. */
export function blockFields(block: Pick<PageBlock, 'fields'>): Record<string, string> {
  return (block.fields ?? {}) as Record<string, string>
}

export function blockDraftFields(
  block: Pick<PageBlock, 'fields' | 'draft_fields'>
): Record<string, string> {
  return ((block.draft_fields ?? block.fields) ?? {}) as Record<string, string>
}

/** A block is dirty when it carries an unpublished draft payload. */
export function isDirty(block: Pick<PageBlock, 'draft_fields'>): boolean {
  return block.draft_fields !== null && block.draft_fields !== undefined
}

/** `stats` values are authored as `figure · label`; split on the middot. */
export function splitStat(value: string): { figure: string; label: string } {
  const [figure, ...rest] = value.split('·')
  return { figure: (figure ?? '').trim(), label: rest.join('·').trim() }
}

export function validateBlock(kind: BlockKind, fields: Json) {
  return blockRegistry[kind].schema.safeParse(fields ?? {})
}
