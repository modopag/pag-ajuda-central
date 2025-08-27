-- SECURITY FIX 3: Fix function search path security issue
-- Set proper search_path for unaccent function to prevent SQL injection

-- Recreate the unaccent function with proper security definer and search path
CREATE OR REPLACE FUNCTION public.unaccent(text)
RETURNS text
LANGUAGE sql
STABLE PARALLEL SAFE STRICT
SECURITY DEFINER
SET search_path = 'extensions, public'
AS $$
  SELECT extensions.unaccent('extensions.unaccent', $1);
$$;