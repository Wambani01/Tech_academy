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

-- media: replace public_id values with the real Cloudinary ids after upload
insert into media_assets (public_id, filename, folder, width, height, alt) values
  ('marketing/hero-classroom-daylight', 'hero-classroom-daylight.png', 'marketing', 2560, 1440, 'Sunlit classroom with students working at laptops'),
  ('marketing/cohort-classroom',        'cohort-classroom.png',        'marketing', 2560, 1440, 'A cohort working around a shared table'),
  ('courses/track-ai-marketing',        'track-ai-marketing.png',      'courses',   2560, 1440, 'Marketer reviewing a campaign dashboard'),
  ('courses/track-brand-design',        'track-brand-design.png',      'courses',   2560, 1440, 'Brand colour swatches on a desk'),
  ('courses/track-development',         'track-development.png',       'courses',   2560, 1440, 'Two developers pair-programming'),
  ('courses/track-automation',          'track-automation.png',        'courses',   2560, 1440, 'Workflow cards mapped on a glass board'),
  ('marketing/business-team-training',  'business-team-training.png',  'marketing', 2400, 1600, 'A team in a private training session'),
  ('marketing/campus-evening-study',    'campus-evening-study.png',    'marketing', 2400, 1600, 'Student studying at home in the evening'),
  ('marketing/campus-exterior',         'campus-exterior.png',         'marketing', 2048, 1536, 'Academy building at golden hour'),
  ('people/instructor-sarah',           'instructor-sarah.png',        'people',    2048, 1536, 'Portrait of an instructor in a classroom'),
  ('people/instructor-tom',             'instructor-tom.png',          'people',    2048, 1536, 'Portrait of an instructor in a studio'),
  ('people/students-whiteboard',        'students-whiteboard.png',     'people',    2048, 1536, 'Students at a whiteboard'),
  ('courses/course-workspace',          'course-workspace.png',        'courses',   2560, 1440, 'Course workspace still life');

-- pages + blocks. fields payloads mirror the block registry.
insert into pages (slug, title, status, published_at) values
  ('home',     'Homepage',        'published', now()),
  ('about',    'About',           'published', now()),
  ('business', 'For Business',    'published', now()),
  ('campus',   'Digital Campus',  'published', now()),
  ('events',   'Events',          'published', now());

insert into page_blocks (page_id, position, kind, fields, image_id)
select p.id, 1, 'hero', jsonb_build_object(
         'eyebrow', 'East Africa''s Practical Tech Academy',
         'headline', 'Learn the skills that get you hired & paid.',
         'sub', 'Cohort-based programs in marketing, design, development and AI tools — real projects, real feedback, real portfolio.',
         'cta1', 'Browse Programs',
         'cta2', 'For Teams'),
       m.id
from pages p, media_assets m
where p.slug = 'home' and m.public_id = 'marketing/hero-classroom-daylight';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 6, 'faq', jsonb_build_object(
         'title', 'Questions people ask before enrolling',
         'intro', 'Everything about cohorts, payment and certificates. Still unsure? Talk to admissions.')
from pages p where p.slug = 'home';
