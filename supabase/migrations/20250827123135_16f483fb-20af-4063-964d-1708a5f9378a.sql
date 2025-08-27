create type user_role as enum ('admin','editor','pending');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role user_role not null default 'pending',
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on profiles table
alter table public.profiles enable row level security;

-- Create RLS policies for profiles
create policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Admins can view all profiles"
on public.profiles for select
using (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() 
    and role = 'admin'::user_role 
    and status = 'approved'
  )
);

create policy "Admins can update all profiles"
on public.profiles for update
using (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() 
    and role = 'admin'::user_role 
    and status = 'approved'
  )
);

-- Create updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at trigger to profiles
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

-- Handle new user creation
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role, status)
  values (new.id, new.email, 'pending', 'pending');
  return new;
end;
$$;

-- Drop existing trigger if exists and create new one
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();