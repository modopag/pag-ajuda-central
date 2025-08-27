-- Ensure root admin exists and is properly configured
SELECT ensure_root_admin();

-- Update root admin to have the correct info if user already exists  
UPDATE auth.users 
SET 
  email = 'contato@modopag.com.br',
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmed_at = COALESCE(confirmed_at, now())
WHERE email = 'contato@modopag.com.br';

-- Force creation if auth.users record doesn't exist
DO $$
BEGIN
  -- Check if user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'contato@modopag.com.br') THEN
    -- Create the user in auth.users if it doesn't exist
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '271a5b1b-c4af-40e6-ab95-bdc36d57df0d'::uuid,
      'authenticated',
      'authenticated', 
      'contato@modopag.com.br',
      crypt('ModoPag2024!', gen_salt('bf')),
      now(),
      now(),
      now(),
      now(),
      '{"name": "Vitor Melo"}'::jsonb
    );
  END IF;
END $$;