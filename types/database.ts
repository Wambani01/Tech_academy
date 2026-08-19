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

type Rel<Name extends string, Col extends string, Ref extends string, One extends boolean = false> = {
  foreignKeyName: Name
  columns: [Col]
  isOneToOne: One
  referencedRelation: Ref
  referencedColumns: ['id']
}

type TableDef<Row, Rels extends readonly unknown[] = []> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: Rels
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile>
      instructors: TableDef<
        Instructor,
        [Rel<'instructors_profile_id_fkey', 'profile_id', 'profiles'>]
      >
      courses: TableDef<
        Course,
        [Rel<'courses_lead_instructor_id_fkey', 'lead_instructor_id', 'instructors'>]
      >
      modules: TableDef<Module, [Rel<'modules_course_id_fkey', 'course_id', 'courses'>]>
      lessons: TableDef<Lesson, [Rel<'lessons_module_id_fkey', 'module_id', 'modules'>]>
      enrollments: TableDef<
        Enrollment,
        [
          Rel<'enrollments_profile_id_fkey', 'profile_id', 'profiles'>,
          Rel<'enrollments_course_id_fkey', 'course_id', 'courses'>,
        ]
      >
      lesson_progress: TableDef<
        LessonProgress,
        [
          Rel<'lesson_progress_profile_id_fkey', 'profile_id', 'profiles'>,
          Rel<'lesson_progress_lesson_id_fkey', 'lesson_id', 'lessons'>,
        ]
      >
      assignments: TableDef<
        Assignment,
        [Rel<'assignments_course_id_fkey', 'course_id', 'courses'>]
      >
      submissions: TableDef<
        Submission,
        [
          Rel<'submissions_assignment_id_fkey', 'assignment_id', 'assignments'>,
          Rel<'submissions_profile_id_fkey', 'profile_id', 'profiles'>,
        ]
      >
      certificates: TableDef<
        Certificate,
        [
          Rel<'certificates_profile_id_fkey', 'profile_id', 'profiles'>,
          Rel<'certificates_course_id_fkey', 'course_id', 'courses'>,
        ]
      >
      events: TableDef<EventRow>
      registrations: TableDef<
        Registration,
        [
          Rel<'registrations_event_id_fkey', 'event_id', 'events'>,
          Rel<'registrations_profile_id_fkey', 'profile_id', 'profiles'>,
        ]
      >
      media_assets: TableDef<MediaAsset>
      pages: TableDef<Page, [Rel<'pages_updated_by_fkey', 'updated_by', 'profiles'>]>
      page_blocks: TableDef<
        PageBlock,
        [
          Rel<'page_blocks_page_id_fkey', 'page_id', 'pages'>,
          Rel<'page_blocks_image_id_fkey', 'image_id', 'media_assets'>,
          Rel<'page_blocks_updated_by_fkey', 'updated_by', 'profiles'>,
        ]
      >
      faqs: TableDef<Faq, [Rel<'faqs_updated_by_fkey', 'updated_by', 'profiles'>]>
      enquiries: TableDef<
        Enquiry,
        [
          Rel<'enquiries_course_id_fkey', 'course_id', 'courses'>,
          Rel<'enquiries_profile_id_fkey', 'profile_id', 'profiles'>,
        ]
      >
      payments: TableDef<
        Payment,
        [
          Rel<'payments_profile_id_fkey', 'profile_id', 'profiles'>,
          Rel<'payments_course_id_fkey', 'course_id', 'courses'>,
        ]
      >
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
