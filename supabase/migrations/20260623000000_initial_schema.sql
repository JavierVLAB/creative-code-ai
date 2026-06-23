-- Perfil de usuario, vinculado a auth.users
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Proyectos de arte generativo
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text,
  sketch_js   text,           -- código p5.js / three.js actual
  config_yaml text,           -- parámetros del sketch en YAML
  memory      text,           -- memoria del agente para este proyecto
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Snapshots: versiones guardadas de un proyecto
create table public.snapshots (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  label      text,            -- nombre opcional del snapshot
  sketch_js  text,
  config_yaml text,
  created_at timestamptz not null default now()
);

-- Assets: imágenes u otros archivos asociados a un proyecto
create table public.assets (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  url        text not null,   -- URL de Supabase Storage
  mime_type  text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.profiles  enable row level security;
alter table public.projects   enable row level security;
alter table public.snapshots  enable row level security;
alter table public.assets     enable row level security;

-- profiles: cada usuario ve y edita solo su perfil
create policy "profiles: select own"  on public.profiles for select using (id = auth.uid());
create policy "profiles: insert own"  on public.profiles for insert with check (id = auth.uid());
create policy "profiles: update own"  on public.profiles for update using (id = auth.uid());

-- projects: acceso completo solo al propietario
create policy "projects: select own"  on public.projects for select using (user_id = auth.uid());
create policy "projects: insert own"  on public.projects for insert with check (user_id = auth.uid());
create policy "projects: update own"  on public.projects for update using (user_id = auth.uid());
create policy "projects: delete own"  on public.projects for delete using (user_id = auth.uid());

-- snapshots: acceso completo solo al propietario
create policy "snapshots: select own" on public.snapshots for select using (user_id = auth.uid());
create policy "snapshots: insert own" on public.snapshots for insert with check (user_id = auth.uid());
create policy "snapshots: delete own" on public.snapshots for delete using (user_id = auth.uid());

-- assets: acceso completo solo al propietario
create policy "assets: select own"    on public.assets for select using (user_id = auth.uid());
create policy "assets: insert own"    on public.assets for insert with check (user_id = auth.uid());
create policy "assets: delete own"    on public.assets for delete using (user_id = auth.uid());

-- ── Trigger: crear perfil automáticamente al registrarse ─────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
