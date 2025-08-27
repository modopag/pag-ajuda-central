-- Fix infinite recursion in profiles RLS policies
-- Replace recursive policies with function-based policies

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create proper non-recursive policies using the existing is_current_user_admin function
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO public 
USING (is_current_user_admin());

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO public 
USING (is_current_user_admin());

-- Ensure the admin function exists and works properly
-- Update the function to be more robust
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role 
    AND status = 'approved'
  );
$function$;