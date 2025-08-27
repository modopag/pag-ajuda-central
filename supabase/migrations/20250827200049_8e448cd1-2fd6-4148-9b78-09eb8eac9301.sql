-- Security Fix: Strengthen RLS policies and admin validation
-- This addresses multiple security findings related to user data protection

-- 1. Strengthen the admin validation function with better security
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role 
    AND status = 'approved'
    AND email IS NOT NULL
    AND auth.uid() IS NOT NULL
  );
$$;

-- 2. Create a stricter admin validation for sensitive operations
CREATE OR REPLACE FUNCTION public.is_root_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email = 'contato@modopag.com.br'
    AND role = 'admin'::user_role 
    AND status = 'approved'
    AND auth.uid() IS NOT NULL
  );
$$;

-- 3. Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admin full access to users" ON public.users;

-- 4. Create more restrictive policies for users table
CREATE POLICY "Users can view only their own user record"
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid() AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update only their own user record"
ON public.users
FOR UPDATE  
TO authenticated
USING (id = auth.uid() AND auth.uid() IS NOT NULL)
WITH CHECK (id = auth.uid() AND auth.uid() IS NOT NULL);

CREATE POLICY "Root admin can manage users"
ON public.users
FOR ALL
TO authenticated
USING (is_root_admin())
WITH CHECK (is_root_admin());

-- 5. Strengthen profiles table policies - drop broad admin access
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 6. Create more restrictive profile policies
CREATE POLICY "Root admin full access to profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (is_root_admin())
WITH CHECK (is_root_admin());

CREATE POLICY "Regular admin limited profile access"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_current_user_admin() 
  AND (
    -- Admins can see pending users for approval
    status = 'pending' 
    -- Or users in their management scope (not other admins)
    OR (role != 'admin'::user_role)
    -- Or their own profile
    OR id = auth.uid()
  )
);

CREATE POLICY "Regular admin can update non-admin profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  is_current_user_admin() 
  AND role != 'admin'::user_role 
  AND id != auth.uid()
)
WITH CHECK (
  is_current_user_admin() 
  AND role != 'admin'::user_role
);

-- 7. Strengthen analytics policies
DROP POLICY IF EXISTS "Admin read access to analytics" ON public.analytics_events;

CREATE POLICY "Root admin analytics access"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (is_root_admin());

-- 8. Strengthen feedback policies  
DROP POLICY IF EXISTS "Admin read access for feedback" ON public.feedback;

CREATE POLICY "Root admin feedback access"
ON public.feedback
FOR SELECT
TO authenticated
USING (is_root_admin());

-- 9. Add audit logging function for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  table_name text,
  operation text,
  record_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log sensitive data access for audit trail
  INSERT INTO public.analytics_events (event_type, data)
  VALUES (
    'sensitive_data_access',
    jsonb_build_object(
      'user_id', auth.uid(),
      'table_name', table_name,
      'operation', operation,
      'record_id', record_id,
      'timestamp', now()
    )
  );
EXCEPTION 
  WHEN OTHERS THEN
    -- Don't block operations if logging fails
    NULL;
END;
$$;

-- 10. Add rate limiting for public operations
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  operation_type text,
  max_per_hour integer DEFAULT 100
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Count recent operations from this IP/user
  SELECT COUNT(*) INTO recent_count
  FROM public.analytics_events
  WHERE event_type = operation_type
  AND (
    (auth.uid() IS NOT NULL AND data->>'user_id' = auth.uid()::text)
    OR (auth.uid() IS NULL AND data->>'ip' = current_setting('request.headers')::json->>'x-forwarded-for')
  )
  AND timestamp > now() - interval '1 hour';
  
  RETURN recent_count < max_per_hour;
END;
$$;