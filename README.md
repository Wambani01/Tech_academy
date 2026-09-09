# Tech Lab Academy

Marketing site, student area and admin console for a Nairobi-based practical
tech school. Built from the design handoff in `design_handoff_tech_lab_academy/`
— 36 screens across three surfaces.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript |
| Styling | Tailwind CSS v4, tokens in `app/globals.css` |
| Database & auth | Supabase — Postgres, Auth, RLS |
| Media | Cloudinary — images and lesson video |
| Hosting | Vercel |

**Payments are out of scope for v1.** The course pages lead to an enquiry flow;
the `payments` table exists in the schema but nothing writes to it until v2.

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in the values below
npm run dev
```

The site runs without Supabase configured — the public pages fall back to the
seed content in `lib/content/` so you can work on the marketing surface before
the database exists. Auth, the student area and the console need a real project.

### Environment

| Variable | Where it is used |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | every Supabase call |
| `SUPABASE_SERVICE_ROLE_KEY` | server only; reserved for the v2 payment webhooks |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | image and video delivery |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | signing media-library uploads, server only |
| `RESEND_API_KEY` / `ENQUIRY_NOTIFY_EMAIL` | admissions notification on a new enquiry |
| `NEXT_PUBLIC_SITE_URL` | metadata and auth redirects |

### Database

```bash
supabase db push                       # applies supabase/migrations
psql "$DATABASE_URL" -f supabase/seed.sql
supabase gen types typescript --project-id <id> --schema public > types/database.ts
```

`supabase/migrations/` holds the 18-table schema and the RLS policies;
`supabase/seed.sql` loads the prototypes' content as real rows — instructors,
courses, events, FAQs, media, and the complete page/block tree for all five
CMS-managed pages.

Make your own account an admin once you have signed up:

```sql
update profiles set role = 'admin' where email = 'you@techlabacademy.co';
```

### Media

The 13 photographs live in Cloudinary under `tech-lab-academy/{marketing,courses,people}/`,
and `supabase/seed.sql` carries those ids. The namespace exists because the
product environment is shared with another project; `ASSET_NAMESPACE` in
`lib/cloudinary.ts` is the single place it is defined.

Two folder concepts sit side by side and are easy to confuse:

| | Value | Used for |
|---|---|---|
| `public_id` prefix | `tech-lab-academy/marketing` | where the asset lives in Cloudinary, and its delivery URL |
| `media_assets.folder` | `marketing` | the console's filter pills, nothing else |

`/api/cloudinary/sign` returns both — `uploadFolder` for the Cloudinary form
field, `category` for the database row — so a console upload lands in the right
place without the namespace leaking into the UI.

Delivery goes through the explicit transformation params in `lib/cloudinary.ts`
(`c_fill,g_auto,…` per slot). The handoff also names transformations `t_hero`,
`t_card`, `t_portrait` and `t_thumb`; creating them in the Cloudinary console is
optional polish, since the params are inlined precisely so delivery works
without them.

`ASSET_FALLBACK` in `lib/content/defaults.ts` still maps those 13 ids back to
their original CDN links, so a checkout with no `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
renders the marketing site instead of placeholders. It is a development
convenience and can be deleted once every environment has the cloud name.

## Layout

```
app/
  (marketing)/   public pages, revalidated on publish
  (auth)/        sign-in, sign-up, reset-password
  (student)/     dashboard, learn, assignments, certificates, settings
  admin/         console — role-guarded, never prerendered
  api/           cloudinary/sign · enquiries · registrations
components/      marketing/ · student/ · admin/ · ui/ · auth/
lib/
  supabase/      server.ts · client.ts · middleware.ts
  cms/           schemas.ts (block registry) · actions.ts · faq-actions.ts
  content/       seed fallbacks for an unconfigured database
  cloudinary.ts · format.ts · validation.ts · queries.ts · admin.ts · student.ts
supabase/        migrations/ · seed.sql
types/database.ts
```

## How the CMS works

A page is a row in `pages` plus ordered rows in `page_blocks`. Each block has a
`kind`, a `fields` payload and optionally one image.

`lib/cms/schemas.ts` is the single source of truth: one entry per block kind
with a Zod schema, a label and a hint. **The admin form is generated from that
schema** — the field list, the controls and the character counters all read from
it, so adding a block kind means one registry entry, one component in
`components/marketing/blocks.tsx`, and a migration extending the `block_kind`
enum.

```
edit a field    → page_blocks.draft_fields = merged payload
Save draft      → persists draft_fields; the page status is unchanged
Publish changes → fields = draft_fields; draft_fields = null;
                  pages.published_at = now(); revalidatePath('/' + slug)
```

A block is dirty when `draft_fields is not null` — that drives the amber dot in
the block rail and the "N blocks changed and not yet published" header note.
Public pages read `fields`; the editor reads `draft_fields ?? fields`.

Collections are separate tables with their own managers. A page's FAQ block
stores only the heading and intro; the questions come from `faqs` where
`is_live`, managed at `/admin/faqs`.

## Conventions worth keeping

- **Destructive actions are always a modal**, and the body states the real
  consequence — how many students lose access, how many registrants get emailed,
  what gets archived. That specificity is the point of the pattern.
- **Forms validate on submit, not on blur.** Error text sits under the field at
  `12px/600` in `--color-amber-deep`.
- **One breakpoint family at 860px.** Sidebars become top bars, grids collapse to
  one column, and wide admin tables scroll horizontally rather than squash.
- **Authenticated surfaces are never prerendered** — the `(student)` and `admin`
  layouts force dynamic rendering so a signed-out redirect can't be baked in.

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Not built yet

- **Payments (v2).** M-Pesa STK push and Stripe Checkout, webhooks creating
  enrolments, and the `Payment Failed` screen the handoff parks.
- **Server-rendered certificate PDFs.** `/verify/[serial]` is live — a public,
  printable certificate page that doubles as the verification link, so
  print-to-PDF covers the download. A generated PDF artefact is phase 6.
  The route needs `SUPABASE_SERVICE_ROLE_KEY`: RLS scopes certificates to their
  owner, so the lookup runs with the service role, narrowed to an exact serial
  match returning only what is printed on the certificate.
- **Transactional email beyond the enquiry notification**, sitemap and robots.
