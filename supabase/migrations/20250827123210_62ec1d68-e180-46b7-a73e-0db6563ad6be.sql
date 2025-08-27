-- Create enum type for user roles
create type user_role as enum ('admin','editor','pending');

-- Add new columns to existing profiles table
alter table public.profiles 
add column if not exists email text unique,
add column if not exists status text not null default 'pending';

-- Update role column to use enum (first add new column, then migrate data)
alter table public.profiles 
add column if not exists new_role user_role not null default 'pending';

-- Migrate existing role data
update public.profiles 
set new_role = case 
  when role = 'admin' then 'admin'::user_role
  when role = 'editor' then 'editor'::user_role  
  else 'pending'::user_role
end;

-- Drop old role column and rename new one
alter table public.profiles drop column if exists role;
alter table public.profiles rename column new_role to role;

-- Create RLS policies for admin access (only if they don't exist)
do $$ 
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Admins can view all profiles'
  ) then
    execute 'create policy "Admins can view all profiles"
    on public.profiles for select
    using (
      exists (
        select 1 from public.profiles p2
        where p2.id = auth.uid() 
        and p2.role = ''admin''::user_role 
        and p2.status = ''approved''
      )
    )';
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Admins can update all profiles'
  ) then
    execute 'create policy "Admins can update all profiles"
    on public.profiles for update
    using (
      exists (
        select 1 from public.profiles p2
        where p2.id = auth.uid() 
        and p2.role = ''admin''::user_role 
        and p2.status = ''approved''
      )
    )';
  end if;
end $$;

-- Handle new user creation
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
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

-- Drop existing trigger if exists and create new one
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();