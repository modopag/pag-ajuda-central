-- SECURITY FIX 2: Move extensions to proper schema
-- Move unaccent extension from public to extensions schema for better security

-- Check if extensions schema exists, create if not
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move unaccent extension to extensions schema
-- Note: This requires recreating the extension
DROP EXTENSION IF EXISTS unaccent CASCADE;
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA extensions;

-- Update function to use extension from correct schema
CREATE OR REPLACE FUNCTION public.unaccent(text)
RETURNS text
LANGUAGE sql
STABLE PARALLEL SAFE STRICT
AS $$
  SELECT extensions.unaccent('extensions.unaccent', $1);
$$;