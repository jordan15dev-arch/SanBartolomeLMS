create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  lrn_or_employee_id text unique,
  role text not null default 'student'
    constraint profiles_role_check check (role in ('student', 'teacher')),
  created_at timestamptz not null default now(),
  oauth_role_pending boolean not null default false
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_role text;
  auth_provider text;
begin
  selected_role := new.raw_user_meta_data ->> 'role';
  if selected_role is null or selected_role not in ('student', 'teacher') then
    selected_role := 'student';
  end if;

  auth_provider := new.raw_app_meta_data ->> 'provider';

  insert into public.profiles (
    id,
    full_name,
    email,
    lrn_or_employee_id,
    role,
    created_at,
    oauth_role_pending
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'lrn_or_employee_id', ''),
    selected_role,
    new.created_at,
    auth_provider = 'google'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

create or replace function public.complete_google_profile(requested_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if requested_role not in ('student', 'teacher') then
    raise exception 'Invalid role';
  end if;

  update public.profiles
  set role = requested_role,
      oauth_role_pending = false
  where id = (select auth.uid())
    and oauth_role_pending = true;
end;
$$;

revoke all on function public.complete_google_profile(text) from public;
grant execute on function public.complete_google_profile(text) to authenticated;

grant select on public.profiles to authenticated;
