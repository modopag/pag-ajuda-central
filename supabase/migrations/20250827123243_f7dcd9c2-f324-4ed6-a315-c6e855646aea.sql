-- Fix function search path security issue
create or replace function public.handle_new_user()
returns trigger 
language plpgsql 
security definer 
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, status, name)
  values (
    new.id, 
    new.email, 
    'pending'::user_role, 
    'pending',
    coalesce(new.raw_user_meta_data->>'name', new.email)
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;