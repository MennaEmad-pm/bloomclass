-- =============================================
-- Course Companion — Supabase Database Setup
-- Run this entire file in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- =============================================

-- 1. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  linkedin_url TEXT,
  current_position TEXT DEFAULT 'Student',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sessions table (5 course sessions)
CREATE TABLE IF NOT EXISTS public.sessions (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  presentation_url TEXT,
  notes TEXT
);

-- 3. Assignment Posts table (admin-posted assignments)
CREATE TABLE IF NOT EXISTS public.assignment_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  posted_by UUID REFERENCES auth.users ON DELETE SET NULL
);

-- 4. Assignments table (student submissions)
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  group_name TEXT NOT NULL,
  task_link TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  assignment_post_id UUID REFERENCES public.assignment_posts(id) ON DELETE SET NULL
);

-- =============================================
-- Seed 5 sessions
-- =============================================
INSERT INTO public.sessions (id, title) VALUES
  (1, 'Introduction & Course Overview'),
  (2, 'Session 2'),
  (3, 'Session 3'),
  (4, 'Session 4'),
  (5, 'Session 5')
ON CONFLICT (id) DO NOTHING;

-- 4. Course Rules table (editable by admin)
CREATE TABLE IF NOT EXISTS public.course_rules (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

INSERT INTO public.course_rules (text, order_index) VALUES
  ('Respect all participants and maintain a safe, inclusive space.', 1),
  ('Be punctual — join sessions on time and notify if you''ll be late.', 2),
  ('Keep your camera on during live sessions when possible.', 3),
  ('Engage actively: ask questions, participate in discussions.', 4),
  ('Submit assignments before stated deadlines.', 5),
  ('No plagiarism — all work must be your own or properly attributed.', 6),
  ('Be constructive in feedback, both giving and receiving.', 7),
  ('Keep course materials confidential.', 8)
ON CONFLICT DO NOTHING;

-- =============================================
-- Row Level Security
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_rules ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, users update their own
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sessions: anyone can read, only admins can update
CREATE POLICY "sessions_select" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "sessions_update" ON public.sessions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Assignment Posts: anyone can read, only admins can insert/update/delete
CREATE POLICY "aposts_select" ON public.assignment_posts FOR SELECT USING (true);
CREATE POLICY "aposts_insert" ON public.assignment_posts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "aposts_update" ON public.assignment_posts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "aposts_delete" ON public.assignment_posts FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Assignments: anyone can read, authenticated users can insert
CREATE POLICY "assignments_select" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "assignments_insert" ON public.assignments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Course Rules: anyone can read, only admins can modify
CREATE POLICY "rules_select" ON public.course_rules FOR SELECT USING (true);
CREATE POLICY "rules_insert" ON public.course_rules FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "rules_update" ON public.course_rules FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "rules_delete" ON public.course_rules FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- =============================================
-- Auto-create profile row when user signs up
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- To make Menna Emad an admin, run this AFTER
-- she has signed up with her account:
-- UPDATE public.profiles SET is_admin = true WHERE email = 'her-email@example.com';
-- =============================================

-- =============================================
-- MIGRATION — run this if you already had the
-- assignments table before the assignment_posts
-- feature was added:
-- =============================================
-- CREATE TABLE IF NOT EXISTS public.assignment_posts (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   title TEXT NOT NULL,
--   description TEXT NOT NULL,
--   posted_at TIMESTAMPTZ DEFAULT NOW(),
--   posted_by UUID REFERENCES auth.users ON DELETE SET NULL
-- );
-- ALTER TABLE public.assignment_posts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "aposts_select" ON public.assignment_posts FOR SELECT USING (true);
-- CREATE POLICY "aposts_insert" ON public.assignment_posts FOR INSERT
--   WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
-- CREATE POLICY "aposts_update" ON public.assignment_posts FOR UPDATE
--   USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
-- CREATE POLICY "aposts_delete" ON public.assignment_posts FOR DELETE
--   USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
-- ALTER TABLE public.assignments
--   ADD COLUMN IF NOT EXISTS assignment_post_id UUID REFERENCES public.assignment_posts(id) ON DELETE SET NULL;
