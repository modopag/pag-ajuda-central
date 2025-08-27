-- SECURITY FIX: Restrict feedback table access to admins only
-- Remove public read access and implement admin-only access

-- Drop the existing public read policy
DROP POLICY IF EXISTS "Public read access for feedback" ON public.feedback;

-- Create admin-only read access policy
CREATE POLICY "Admin read access for feedback" 
ON public.feedback 
FOR SELECT 
USING (is_current_user_admin());

-- Keep the public insert policy as users need to submit feedback
-- But ensure we're not storing unnecessary personal data
-- Note: The public insert policy remains as users need to submit feedback