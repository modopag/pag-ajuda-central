-- Phase 1: Secure the settings table and strengthen RLS policies

-- Create a security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY definer
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Create a function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY definer
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Update settings table RLS policies to be admin-only
DROP POLICY IF EXISTS "Admin full access to settings" ON public.settings;

CREATE POLICY "Admin read access to settings"
ON public.settings
FOR SELECT
USING (public.is_current_user_admin());

CREATE POLICY "Admin write access to settings"
ON public.settings
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Update users table RLS to be more restrictive
DROP POLICY IF EXISTS "Admin full access to users" ON public.users;

CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Admin full access to users"
ON public.users
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Update other admin tables to use the security definer function
DROP POLICY IF EXISTS "Admin full access to categories" ON public.categories;
CREATE POLICY "Admin full access to categories"
ON public.categories
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin full access to articles" ON public.articles;
CREATE POLICY "Admin full access to articles"
ON public.articles
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin full access to tags" ON public.tags;
CREATE POLICY "Admin full access to tags"
ON public.tags
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin full access to article_tags" ON public.article_tags;
CREATE POLICY "Admin full access to article_tags"
ON public.article_tags
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin full access to media" ON public.media;
CREATE POLICY "Admin full access to media"
ON public.media
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin full access to redirects" ON public.redirects;
CREATE POLICY "Admin full access to redirects"
ON public.redirects
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admin full access to slug_history" ON public.slug_history;
CREATE POLICY "Admin full access to slug_history"
ON public.slug_history
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  role text NOT NULL DEFAULT 'viewer',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admin full access to profiles"
ON public.profiles
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Create trigger for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    'viewer'
  );
  RETURN new;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update profiles updated_at trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();