-- First, let's create the missing user and set up the admin profile
-- Create admin user in profiles table (the user already exists in auth.users)
INSERT INTO public.profiles (id, email, role, status, name)
VALUES (
  '271a5b1b-c4af-40e6-ab95-bdc36d57df0d'::uuid, 
  'contato@modopag.com.br', 
  'admin'::user_role, 
  'approved',
  'Vitor Melo'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin'::user_role,
  status = 'approved',
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = now();