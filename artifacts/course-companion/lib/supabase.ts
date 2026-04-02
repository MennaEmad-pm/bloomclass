import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  linkedin_url: string | null;
  current_position: string;
  is_admin: boolean;
};

export type CourseSession = {
  id: number;
  title: string;
  presentation_url: string | null;
  notes: string | null;
};

export type Assignment = {
  id: string;
  student_name: string;
  group_name: string;
  task_link: string;
  submitted_at: string;
};

export type CourseRule = {
  id: number;
  text: string;
  order_index: number;
};
