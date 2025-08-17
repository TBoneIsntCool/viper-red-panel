-- Secure profiles table: remove overly-permissive policies and block client access
BEGIN;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    DROP POLICY "Users can view their own profile" ON public.profiles;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can create their own profile'
  ) THEN
    DROP POLICY "Users can create their own profile" ON public.profiles;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    DROP POLICY "Users can update their own profile" ON public.profiles;
  END IF;
END $$;

-- Create explicit deny policies (no anonymous client reads/writes)
CREATE POLICY "deny select to anon" ON public.profiles FOR SELECT USING (false);
CREATE POLICY "deny insert to anon" ON public.profiles FOR INSERT WITH CHECK (false);
CREATE POLICY "deny update to anon" ON public.profiles FOR UPDATE USING (false);
CREATE POLICY "deny delete to anon" ON public.profiles FOR DELETE USING (false);

COMMIT;