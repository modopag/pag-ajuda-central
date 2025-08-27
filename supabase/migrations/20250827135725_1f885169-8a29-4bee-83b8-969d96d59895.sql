-- Ensure root admin exists and is properly configured (without touching confirmed_at)
SELECT ensure_root_admin();

-- Update root admin email confirmation if needed
UPDATE auth.users 
SET 
  email = 'contato@modopag.com.br',
  email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email = 'contato@modopag.com.br';

-- Ensure the profiles record is correct
DO $$
BEGIN
  -- Ensure the profile exists with correct data
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
END $$;