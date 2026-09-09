-- Tech Lab Academy — seed data lifted from the prototypes.
-- Run after 02-rls.sql, as the service role (bypasses RLS).

insert into instructors (full_name, email, track, role_title, bio, position) values
  ('Sarah Kamau',    'sarah.kamau@techlabacademy.co',   'Marketing',  'Lead Instructor',  '10+ years in growth and performance marketing across East Africa.', 1),
  ('Tom Odhiambo',   'tom.odhiambo@techlabacademy.co',  'Design',     'Lead Instructor',  'Brand and product designer; formerly in-house at two Nairobi studios.', 2),
  ('Linda Nyambura', 'linda.n@techlabacademy.co',       'Development','Lead Instructor',  'Full-stack engineer teaching the fundamentals the modern way.', 3),
  ('Eric Mutua',     'eric.mutua@techlabacademy.co',    'Automation', 'Lead Instructor',  'Builds internal tools and automations for ops teams.', 4),
  ('Rita Njeri',     'rita.njeri@techlabacademy.co',    'Marketing',  'Guest Instructor', 'Performance marketer specialising in paid social.', 5),
  ('Mercy Wanjiru',  'mercy.w@techlabacademy.co',       'Design',     'Guest Instructor', 'Visual systems designer and illustrator.', 6);

insert into courses (slug, title, track, level, blurb, duration, price_kes, status) values
  ('ai-powered-content-campaigns',   'AI-Powered Content & Campaigns',    'Marketing',  'Beginner',     'Plan, write and automate content and ad campaigns using modern AI tools.', '6 weeks · Cohort',  15000, 'published'),
  ('performance-marketing-analytics','Performance Marketing & Analytics', 'Marketing',  'Intermediate', 'Run paid campaigns and read the data that actually moves budget decisions.', '8 weeks · Cohort', 18000, 'published'),
  ('brand-visual-systems',           'Brand & Visual Systems',            'Design',     'Beginner',     'Build cohesive brand identities and design systems from scratch.', '6 weeks · Cohort',  15000, 'published'),
  ('product-design-with-ai',         'Product Design with AI Tools',      'Design',     'Intermediate', 'Wireframe, prototype and ship UX using AI-assisted design workflows.', '8 weeks · Cohort', 18000, 'draft'),
  ('web-development-foundations',    'Web Development Foundations',       'Development','Beginner',     'HTML, CSS and JavaScript fundamentals, built the modern way.', '10 weeks · Cohort', 22000, 'published'),
  ('ai-assisted-app-development',    'AI-Assisted App Development',       'Development','Advanced',     'Ship full-stack apps faster with AI pair-programming tools.', '10 weeks · Cohort', 25000, 'published'),
  ('no-code-workflow-automation',    'No-Code Workflow Automation',       'Automation', 'Beginner',     'Automate repetitive work and connect tools without writing code.', '4 weeks · Cohort', 12000, 'published'),
  ('internal-tools-for-ops',         'Internal Tools for Ops Teams',      'Automation', 'Intermediate', 'Build lightweight internal tools that replace spreadsheets and email.', '6 weeks · Cohort', 15000, 'draft');

insert into events (slug, title, track, format, starts_at, capacity, description, status) values
  ('ai-campaign-automation-90',  'AI Campaign Automation in 90 Minutes',  'Marketing',  'Online, Live', '2026-07-14 18:00+03', 300, 'A hands-on session on automating campaign workflows with AI.', 'past'),
  ('brand-system-with-ai',       'Building a Brand System with AI Tools', 'Design',     'Online, Live', '2026-07-28 18:00+03', 250, 'From moodboard to type scale in one sitting.', 'past'),
  ('shipping-faster-ai-coding',  'Shipping Faster with AI Pair-Coding',   'Development','Online, Live', '2026-08-09 18:00+03', 200, 'Live build: an app in ninety minutes.', 'past'),
  ('no-code-small-teams',        'No-Code Tools for Small Teams',         'Automation', 'Hybrid',       '2026-08-21 18:00+03', 150, 'Replace three spreadsheets with one workflow.', 'past'),
  ('portfolio-reviews-live-q4',  'Portfolio Reviews Live',               'Design',     'Online, Live', '2026-09-24 18:00+03', 180, 'Bring work in progress; leave with notes.', 'upcoming'),
  ('content-strategy-2027',      'Content Strategy for 2027',            'Marketing',  'Online, Live', '2026-10-08 18:00+03', 300, 'What is changing in search and social next year.', 'upcoming');

-- FAQ collection, in display order
insert into faqs (position, question, answer, category, is_live) values
  (1, 'Do I need any experience to start?', 'No. Every track has a beginner cohort that starts from first principles. If you already work in the field, the intermediate and advanced cohorts skip the basics.', 'Programs', true),
  (2, 'How much time should I set aside each week?', 'Plan for six to eight hours: two live sessions plus project work you can schedule around a job.', 'Programs', true),
  (3, 'Can I pay in instalments?', 'Yes. Cohort fees can be split across the length of the programme, paid by M-Pesa, card or bank transfer. Ask admissions before you enrol.', 'Payments', true),
  (4, 'What is your refund policy?', 'Full refund up to seven days before your cohort starts, and a pro-rata refund in the first two weeks.', 'Payments', true),
  (5, 'Do I get a certificate?', 'Every completed programme issues a verifiable certificate with a public link you can add to LinkedIn or a CV.', 'Certificates', true),
  (6, 'How long do I keep access to the material?', 'Lifetime access to lesson recordings, templates and resources for any programme you complete.', 'Campus', true),
  (7, 'Are sessions online or in person?', 'Most cohorts run online with live sessions. Selected programmes add optional in-person studio days in Nairobi.', 'Campus', true),
  (8, 'Do you help with job placement?', 'We run portfolio reviews and introduce strong graduates to hiring partners, but we do not guarantee placement.', 'Programs', false);

-- media: the real Cloudinary ids, namespaced under tech-lab-academy/ because the
-- product environment is shared with another project. `folder` stays the bare
-- category — it drives the filter pills in the admin media library, not delivery.
-- Dimensions and byte sizes are the uploaded originals.
insert into media_assets (public_id, filename, folder, width, height, bytes, alt) values
  ('tech-lab-academy/marketing/hero-classroom-daylight', 'hero-classroom-daylight.png', 'marketing', 2560, 1440, 4138160, 'Sunlit classroom with students working at laptops'),
  ('tech-lab-academy/marketing/cohort-classroom',        'cohort-classroom.png',        'marketing', 2560, 1440, 5564876, 'A cohort working around a shared table'),
  ('tech-lab-academy/courses/track-ai-marketing',        'track-ai-marketing.png',      'courses',   2560, 1440, 4849825, 'Marketer reviewing a campaign dashboard'),
  ('tech-lab-academy/courses/track-brand-design',        'track-brand-design.png',      'courses',   2560, 1440, 5450515, 'Brand colour swatches on a desk'),
  ('tech-lab-academy/courses/track-development',         'track-development.png',       'courses',   2560, 1440, 3894596, 'Two developers pair-programming'),
  ('tech-lab-academy/courses/track-automation',          'track-automation.png',        'courses',   2560, 1440, 4102590, 'Workflow cards mapped on a glass board'),
  ('tech-lab-academy/marketing/business-team-training',  'business-team-training.png',  'marketing', 2496, 1664, 5763877, 'A team in a private training session'),
  ('tech-lab-academy/marketing/campus-evening-study',    'campus-evening-study.png',    'marketing', 2496, 1664, 6016109, 'Student studying at home in the evening'),
  ('tech-lab-academy/marketing/campus-exterior',         'campus-exterior.png',         'marketing', 2304, 1728, 7112653, 'Academy building at golden hour'),
  ('tech-lab-academy/people/instructor-sarah',           'instructor-sarah.png',        'people',    2304, 1728, 4622025, 'Portrait of an instructor in a classroom'),
  ('tech-lab-academy/people/instructor-tom',             'instructor-tom.png',          'people',    2304, 1728, 5153361, 'Portrait of an instructor in a studio'),
  ('tech-lab-academy/people/students-whiteboard',        'students-whiteboard.png',     'people',    2304, 1728, 5987145, 'Students at a whiteboard'),
  ('tech-lab-academy/courses/course-workspace',          'course-workspace.png',        'courses',   2560, 1440, 2671891, 'Course workspace still life');

-- pages + blocks. fields payloads mirror the block registry.
insert into pages (slug, title, status, published_at) values
  ('home',     'Homepage',        'published', now()),
  ('about',    'About',           'published', now()),
  ('business', 'For Business',    'published', now()),
  ('campus',   'Digital Campus',  'published', now()),
  ('events',   'Events',          'published', now());

-- page_blocks: the complete set for every seeded page. Payloads mirror the
-- block registry in cms/block-registry.md and lib/cms/schemas.ts.

-- Homepage ------------------------------------------------------------
insert into page_blocks (page_id, position, kind, fields, image_id, image_alt)
select p.id, 1, 'hero', jsonb_build_object(
         'eyebrow',  'East Africa''s Practical Tech Academy',
         'headline', 'Learn the skills that get you hired & paid.',
         'sub',      'Cohort-based programs in marketing, design, development and AI tools — real projects, real feedback, real portfolio.',
         'cta1',     'Browse Programs',
         'cta2',     'For Teams'),
       m.id,
       'Sunlit classroom with students working at laptops'
from pages p, media_assets m
where p.slug = 'home' and m.public_id = 'tech-lab-academy/marketing/hero-classroom-daylight';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 2, 'stats', jsonb_build_object(
         's1', '2,400+ · Trained',
         's2', '4.9★ · Avg rating',
         's3', '35+ · Programs',
         's4', '100% · Hands-on')
from pages p where p.slug = 'home';

insert into page_blocks (page_id, position, kind, fields, image_id, image_alt)
select p.id, 3, 'tracks', jsonb_build_object(
         'title', 'Pick your track',
         't1', 'AI Marketing',
         'b1', 'Campaigns, content & analytics with AI.',
         't2', 'Brand & Product Design',
         'b2', 'Visual systems & AI creative flow.',
         't3', 'Web & App Development',
         'b3', 'Modern stacks, AI pair-coding.',
         't4', 'No-Code Automation',
         'b4', 'Internal tools, zero heavy code.'),
       m.id,
       'Marketer reviewing a campaign dashboard'
from pages p, media_assets m
where p.slug = 'home' and m.public_id = 'tech-lab-academy/courses/track-ai-marketing';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 4, 'steps', jsonb_build_object(
         'title', 'Five steps to a provable skill',
         'step1', 'Enroll',
         'step2', 'Learn by doing',
         'step3', 'Apply it',
         'step4', 'Get certified',
         'step5', 'Keep growing')
from pages p where p.slug = 'home';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 5, 'proof', jsonb_build_object(
         'title',  'What graduates say',
         'quote1', 'I came in able to run ads and left able to explain why they worked. The campaign brief from week four got me the job.',
         'attr1',  'Marketing cohort, 2026',
         'quote2', 'The assignments were real client work in disguise. My portfolio tripled in six weeks.',
         'attr2',  'Design cohort, 2026',
         'quote3', 'Pair-coding with AI properly — not just autocomplete. I ship features I would have quoted a month for.',
         'attr3',  'Development cohort, 2026')
from pages p where p.slug = 'home';

-- The questions themselves live in `faqs`; only the heading is stored here.
insert into page_blocks (page_id, position, kind, fields)
select p.id, 6, 'faq', jsonb_build_object(
         'title', 'Questions people ask before enrolling',
         'intro', 'Everything about cohorts, payment and certificates. Still unsure? Talk to admissions.')
from pages p where p.slug = 'home';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 7, 'cta', jsonb_build_object(
         'title', 'For Individuals',
         'btn',   'Browse All Courses')
from pages p where p.slug = 'home';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 8, 'meta', jsonb_build_object(
         'title', 'Tech Lab Academy — practical tech training in Nairobi',
         'desc',  'Cohort-based programs in marketing, design, development and AI tools — real projects, real feedback, real portfolio.')
from pages p where p.slug = 'home';

-- About ---------------------------------------------------------------
insert into page_blocks (page_id, position, kind, fields)
select p.id, 1, 'hero', jsonb_build_object(
         'eyebrow',  'About Us',
         'headline', 'We built the academy we wished existed.',
         'sub',      'Most training teaches tools in isolation. We pair strategy with hands-on practice, so every graduate leaves with judgment, not just button-pushing skills — and a portfolio to prove it.',
         'cta1',     '',
         'cta2',     '')
from pages p where p.slug = 'about';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 2, 'stats', jsonb_build_object(
         's1', '2019 · Founded',
         's2', '2,400+ · Graduates',
         's3', '35+ · Programs run',
         's4', '18 · Instructors')
from pages p where p.slug = 'about';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 3, 'meta', jsonb_build_object(
         'title', 'About Tech Lab Academy',
         'desc',  'A small, senior team of instructors across marketing, design, development and automation.')
from pages p where p.slug = 'about';

-- For Business --------------------------------------------------------
insert into page_blocks (page_id, position, kind, fields, image_id, image_alt)
select p.id, 1, 'hero', jsonb_build_object(
         'eyebrow',  'For Teams & Organisations',
         'headline', 'Upskill your whole team in AI-first ways of working.',
         'sub',      'Structured, cohort-based training for marketing, design, dev and ops teams — built around your stack, your tools, and your timeline.',
         'cta1',     'Book a Team Demo',
         'cta2',     ''),
       m.id,
       'A team in a private training session'
from pages p, media_assets m
where p.slug = 'business' and m.public_id = 'tech-lab-academy/marketing/business-team-training';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 2, 'stats', jsonb_build_object(
         's1', '3× · Speed',
         's2', '40+ · Orgs',
         's3', '4–12wk · Cohort',
         's4', '')
from pages p where p.slug = 'business';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 3, 'meta', jsonb_build_object(
         'title', 'Corporate training — Tech Lab Academy',
         'desc',  'Custom cohorts for marketing, design, dev and ops teams, built around your stack and goals.')
from pages p where p.slug = 'business';

-- Digital Campus ------------------------------------------------------
insert into page_blocks (page_id, position, kind, fields, image_id, image_alt)
select p.id, 1, 'hero', jsonb_build_object(
         'eyebrow',  'Digital Campus',
         'headline', 'Learn anywhere, apply everywhere.',
         'sub',      'Video lessons, templates and community from any device — with structured milestones so you actually finish.',
         'cta1',     'Explore Campus',
         'cta2',     ''),
       m.id,
       'Student studying at home in the evening'
from pages p, media_assets m
where p.slug = 'campus' and m.public_id = 'tech-lab-academy/marketing/campus-evening-study';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 2, 'meta', jsonb_build_object(
         'title', 'Digital Campus — Tech Lab Academy',
         'desc',  'Video lessons, templates and community from any device, with structured milestones.')
from pages p where p.slug = 'campus';

-- Events --------------------------------------------------------------
insert into page_blocks (page_id, position, kind, fields)
select p.id, 1, 'hero', jsonb_build_object(
         'eyebrow',  'Masterclasses & Events',
         'headline', 'Live sessions with people doing the work right now.',
         'sub',      'One-off masterclasses and short workshops — no long-term commitment, straight to the point.',
         'cta1',     '',
         'cta2',     '')
from pages p where p.slug = 'events';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 2, 'meta', jsonb_build_object(
         'title', 'Masterclasses & events — Tech Lab Academy',
         'desc',  'One-off masterclasses and short workshops with practitioners.')
from pages p where p.slug = 'events';

-- Curriculum for the flagship course, matching the course detail page.
insert into modules (course_id, position, title, duration)
select c.id, v.position, v.title, v.duration
from courses c,
     (values (1, 'Why AI + Strategy Beats Tools Alone', '45 min'),
             (2, 'Building Your Content Calendar',      '1h 10m'),
             (3, 'AI Drafting Without Losing Your Voice','55 min'),
             (4, 'Campaign Brief: Product Launch',      '1h 30m'),
             (5, 'Measuring What Matters',              '50 min'),
             (6, 'Scaling Your Workflow',               '40 min'))
       as v(position, title, duration)
where c.slug = 'ai-powered-content-campaigns';

-- One lesson per module so the player has something to render.
insert into lessons (module_id, position, title, kind)
select m.id, 1, m.title, 'video'
from modules m
join courses c on c.id = m.course_id
where c.slug = 'ai-powered-content-campaigns';

-- Link each course to the lead instructor for its track.
update courses c
set lead_instructor_id = i.id
from instructors i
where i.track = c.track and i.role_title = 'Lead Instructor';
