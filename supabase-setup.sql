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

-- 3. Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  group_name TEXT NOT NULL,
  task_link TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
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

-- =============================================
-- Row Level Security
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, users update their own
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sessions: anyone can read, only admins can update
CREATE POLICY "sessions_select" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "sessions_update" ON public.sessions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Assignments: anyone can read, authenticated users can insert
CREATE POLICY "assignments_select" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "assignments_insert" ON public.assignments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

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
