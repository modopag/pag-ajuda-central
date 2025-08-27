-- Fix authentication flow and approval system

-- 1. Update profiles table to ensure proper approval workflow
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id);

-- 2. Create function to check if user can login (must be approved except root admin)
CREATE OR REPLACE FUNCTION public.can_user_login(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      -- Root admin can always login
      WHEN email = 'contato@modopag.com.br' THEN true
      -- Other users need approval
      ELSE status = 'approved'
    END
  FROM public.profiles 
  WHERE id = user_id;
$$;

-- 3. Create function to ensure root admin always exists and is approved
CREATE OR REPLACE FUNCTION public.ensure_root_admin()
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure root admin profile exists and is properly configured
  INSERT INTO public.profiles (
    id,
    email, 
    role, 
    status, 
    name,
    approved_at,
    created_at,
    updated_at
  ) 
  VALUES (
    '271a5b1b-c4af-40e6-ab95-bdc36d57df0d'::uuid,
    'contato@modopag.com.br',
    'admin'::user_role,
    'approved',
    'Vitor Melo',
    now(),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = 'contato@modopag.com.br',
    role = 'admin'::user_role,
    status = 'approved',
    name = COALESCE(EXCLUDED.name, profiles.name, 'Vitor Melo'),
    approved_at = COALESCE(profiles.approved_at, now()),
    updated_at = now();
    
  -- Ensure no one can disable the root admin
  UPDATE public.profiles 
  SET 
    role = 'admin'::user_role,
    status = 'approved',
    approved_at = COALESCE(approved_at, now())
  WHERE email = 'contato@modopag.com.br';
END;
$$;

-- 4. Create trigger to protect root admin from being modified inappropriately
CREATE OR REPLACE FUNCTION public.protect_root_admin()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Protect root admin from role/status changes by non-root-admins
  IF OLD.email = 'contato@modopag.com.br' AND (
    NEW.role != 'admin'::user_role OR 
    NEW.status != 'approved' OR
    NEW.email != 'contato@modopag.com.br'
  ) THEN
    -- Only allow root admin to modify themselves
    IF auth.uid() != OLD.id THEN
      RAISE EXCEPTION 'Root admin account cannot be modified by other users';
    END IF;
    
    -- Force correct values even if root admin tries to change them
    NEW.role := 'admin'::user_role;
    NEW.status := 'approved';
    NEW.email := 'contato@modopag.com.br';
    NEW.approved_at := COALESCE(OLD.approved_at, now());
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS protect_root_admin_trigger ON public.profiles;
CREATE TRIGGER protect_root_admin_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_root_admin();

-- 5. Enhanced RLS policies for profiles
DROP POLICY IF EXISTS "Root admin protection" ON public.profiles;
CREATE POLICY "Root admin protection" ON public.profiles
  FOR ALL USING (
    -- Root admin can access everything
    email = 'contato@modopag.com.br' AND id = auth.uid()
  );

-- 6. Update the handle_new_user function to set proper initial status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, status, name)
  VALUES (
    new.id, 
    new.email, 
    CASE 
      WHEN new.email = 'contato@modopag.com.br' THEN 'admin'::user_role
      ELSE 'pending'::user_role 
    END,
    CASE 
      WHEN new.email = 'contato@modopag.com.br' THEN 'approved'
      ELSE 'pending'
    END,
    COALESCE(new.raw_user_meta_data->>'name', new.email)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    updated_at = now(),
    -- Ensure root admin maintains correct status
    role = CASE 
      WHEN excluded.email = 'contato@modopag.com.br' THEN 'admin'::user_role
      ELSE profiles.role 
    END,
    status = CASE 
      WHEN excluded.email = 'contato@modopag.com.br' THEN 'approved'
      ELSE profiles.status 
    END;
  RETURN new;
END;
$$;

-- 7. Run the function to ensure root admin exists
SELECT public.ensure_root_admin();

-- 8. Create function to approve users (only admin can use)
CREATE OR REPLACE FUNCTION public.approve_user(user_id UUID)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT (SELECT is_current_user_admin()) THEN
    RAISE EXCEPTION 'Only administrators can approve users';
  END IF;
  
  -- Approve the user
  UPDATE public.profiles 
  SET 
    status = 'approved',
    role = CASE WHEN role = 'pending' THEN 'editor'::user_role ELSE role END,
    approved_at = now(),
    approved_by = auth.uid(),
    updated_at = now()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- 9. Create function to reject users
CREATE OR REPLACE FUNCTION public.reject_user(user_id UUID)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin  
  IF NOT (SELECT is_current_user_admin()) THEN
    RAISE EXCEPTION 'Only administrators can reject users';
  END IF;
  
  -- Don't allow rejecting root admin
  IF (SELECT email FROM public.profiles WHERE id = user_id) = 'contato@modopag.com.br' THEN
    RAISE EXCEPTION 'Cannot reject root admin account';
  END IF;
  
  -- Reject the user
  UPDATE public.profiles 
  SET 
    status = 'rejected',
    updated_at = now()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;