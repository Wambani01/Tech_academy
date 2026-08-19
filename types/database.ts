/**
 * Database types for Tech Lab Academy.
 *
 * Shape matches `supabase gen types typescript`. Regenerate with:
 *   supabase gen types typescript --project-id <id> --schema public > types/database.ts
 * and keep the hand-written aliases at the bottom of the file.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'student' | 'instructor' | 'admin'
export type CourseStatus = 'draft' | 'published' | 'archived'
export type EnrolStatus = 'active' | 'completed' | 'cancelled'
export type SubmitStatus = 'pending' | 'submitted' | 'graded'
export type EventStatus = 'upcoming' | 'past' | 'cancelled'
export type PageStatus = 'draft' | 'published'
export type BlockKind =
  | 'hero'
  | 'stats'
  | 'tracks'
  | 'steps'
  | 'proof'
  | 'faq'
  | 'cta'
  | 'meta'
export type EnquiryStatus = 'new' | 'contacted' | 'enrolled' | 'closed'

export type Profile = {
  id: string
  full_name: string
  email: string
  role: UserRole
  track: string | null
  avatar_id: string | null
  created_at: string
  updated_at: string
}

export type Instructor = {
  id: string
  profile_id: string | null
  full_name: string
  email: string
  track: string
  role_title: string
  bio: string | null
  photo_id: string | null
  position: number
  created_at: string
  updated_at: string
}

export type Course = {
  id: string
  slug: string
  title: string
  track: string
  level: string
  blurb: string
  description: string | null
  duration: string
  price_kes: number
  lead_instructor_id: string | null
  hero_id: string | null
  status: CourseStatus
  created_at: string
  updated_at: string
}

export type Module = {
  id: string
  course_id: string
  position: number
  title: string
  duration: string | null
}

export type Lesson = {
  id: string
  module_id: string
  position: number
  title: string
  kind: string
  video_id: string | null
  duration_s: number | null
  body: string | null
}

export type Enrollment = {
  id: string
  profile_id: string
  course_id: string
  progress_pct: number
  status: EnrolStatus
  enrolled_at: string
}

export type LessonProgress = {
  profile_id: string
  lesson_id: string
  completed_at: string | null
}

export type Assignment = {
  id: string
  course_id: string
  title: string
  brief: string | null
  due_at: string | null
  position: number
}

export type Submission = {
  id: string
  assignment_id: string
  profile_id: string
  body: string | null
  file_id: string | null
  status: SubmitStatus
  score: number | null
  feedback: string | null
  submitted_at: string | null
  graded_at: string | null
}

export type Certificate = {
  id: string
  profile_id: string
  course_id: string
  serial: string
  issued_at: string
}

export type EventRow = {
  id: string
  slug: string
  title: string
  track: string
  format: string
  starts_at: string
  capacity: number | null
  description: string | null
  hero_id: string | null
  status: EventStatus
  created_at: string
}

export type Registration = {
  id: string
  event_id: string
  profile_id: string | null
  name: string | null
  email: string | null
  created_at: string
}

export type MediaAsset = {
  id: string
  public_id: string
  filename: string
  folder: string
  width: number | null
  height: number | null
  bytes: number | null
  alt: string | null
  created_at: string
}

export type Page = {
  id: string
  slug: string
  title: string
  status: PageStatus
  published_at: string | null
  updated_by: string | null
  updated_at: string
}

export type PageBlock = {
  id: string
  page_id: string
  position: number
  kind: BlockKind
  fields: Json
  draft_fields: Json | null
  image_id: string | null
  image_alt: string | null
  updated_by: string | null
  updated_at: string
}

export type Faq = {
  id: string
  position: number
  question: string
  answer: string
  category: string
  is_live: boolean
  updated_by: string | null
  updated_at: string
}

export type Enquiry = {
  id: string
  course_id: string | null
  profile_id: string | null
  full_name: string
  email: string
  phone: string | null
  message: string | null
  status: EnquiryStatus
  created_at: string
}

export type Payment = {
  id: string
  profile_id: string | null
  course_id: string | null
  provider: string
  provider_ref: string | null
  amount_kes: number
  status: string
  raw: Json | null
  created_at: string
}

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile>
      instructors: TableDef<Instructor>
      courses: TableDef<Course>
      modules: TableDef<Module>
      lessons: TableDef<Lesson>
      enrollments: TableDef<Enrollment>
      lesson_progress: TableDef<LessonProgress>
      assignments: TableDef<Assignment>
      submissions: TableDef<Submission>
      certificates: TableDef<Certificate>
      events: TableDef<EventRow>
      registrations: TableDef<Registration>
      media_assets: TableDef<MediaAsset>
      pages: TableDef<Page>
      page_blocks: TableDef<PageBlock>
      faqs: TableDef<Faq>
      enquiries: TableDef<Enquiry>
      payments: TableDef<Payment>
    }
    Views: { [_ in never]: never }
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_instructor_of: { Args: { course: string }; Returns: boolean }
    }
    Enums: {
      user_role: UserRole
      course_status: CourseStatus
      enrol_status: EnrolStatus
      submit_status: SubmitStatus
      event_status: EventStatus
      page_status: PageStatus
      block_kind: BlockKind
      enquiry_status: EnquiryStatus
    }
    CompositeTypes: { [_ in never]: never }
  }
}
