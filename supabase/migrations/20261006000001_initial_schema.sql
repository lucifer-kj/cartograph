-- Phase 2: Schema and RLS Policies
-- Eight tables: projects, analyses, files, edges, routes, explanations, file_roles, insights
-- All tables own their rows through foreign key to organizations(id) on delete cascade.

-- 1. Organizations container table
create table if not exists public.organizations (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

-- 2. Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id text not null references public.organizations(id) on delete cascade,
  name text not null,
  repo_url text not null,
  created_at timestamptz not null default now()
);

-- 3. Analyses
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  org_id text not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  commit_hash text,
  status text not null default 'pending', -- pending, parsing, complete, failed
  stage text,                             -- fetch, select, parse, store
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Files
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  org_id text not null references public.organizations(id) on delete cascade,
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  path text not null,
  folder text not null,
  line_count integer not null default 0,
  hash text,
  fan_in integer not null default 0,
  fan_out integer not null default 0,
  created_at timestamptz not null default now()
);

-- 5. Edges
create table if not exists public.edges (
  id uuid primary key default gen_random_uuid(),
  org_id text not null references public.organizations(id) on delete cascade,
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  source_path text not null,
  target_path text not null,
  kind text not null default 'import', -- import, reexport, dynamic
  created_at timestamptz not null default now()
);

-- 6. Routes
create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  org_id text not null references public.organizations(id) on delete cascade,
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  method text not null,
  path text not null,
  handler_path text not null,
  created_at timestamptz not null default now()
);

-- 7. Explanations
create table if not exists public.explanations (
  id uuid primary key default gen_random_uuid(),
  org_id text not null references public.organizations(id) on delete cascade,
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  file_path text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- 8. File Roles
create table if not exists public.file_roles (
  id uuid primary key default gen_random_uuid(),
  org_id text not null references public.organizations(id) on delete cascade,
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  file_path text not null,
  role text not null,
  created_at timestamptz not null default now()
);

-- 9. Insights
create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  org_id text not null references public.organizations(id) on delete cascade,
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  kind text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Enable Row-Level Security on all tables
alter table public.organizations enable row level security;
alter table public.projects enable row level security;
alter table public.analyses enable row level security;
alter table public.files enable row level security;
alter table public.edges enable row level security;
alter table public.routes enable row level security;
alter table public.explanations enable row level security;
alter table public.file_roles enable row level security;
alter table public.insights enable row level security;

-- Function to extract active organization id from Clerk JWT claims
create or replace function public.current_org_id()
returns text as $$
begin
  return coalesce(
    nullif(auth.jwt() ->> 'org_id', ''),
    nullif((current_setting('request.jwt.claims', true)::jsonb) ->> 'org_id', '')
  );
exception
  when others then
    return null;
end;
$$ language plpgsql stable security definer;

-- Drop existing policies if any
drop policy if exists "organizations_org_isolation" on public.organizations;
drop policy if exists "projects_org_isolation" on public.projects;
drop policy if exists "analyses_org_isolation" on public.analyses;
drop policy if exists "files_org_isolation" on public.files;
drop policy if exists "edges_org_isolation" on public.edges;
drop policy if exists "routes_org_isolation" on public.routes;
drop policy if exists "explanations_org_isolation" on public.explanations;
drop policy if exists "file_roles_org_isolation" on public.file_roles;
drop policy if exists "insights_org_isolation" on public.insights;

-- RLS Policies: Predicate reading organization claim off the auth token
create policy "organizations_org_isolation" on public.organizations
  for all using (id = public.current_org_id());

create policy "projects_org_isolation" on public.projects
  for all using (org_id = public.current_org_id());

create policy "analyses_org_isolation" on public.analyses
  for all using (org_id = public.current_org_id());

create policy "files_org_isolation" on public.files
  for all using (org_id = public.current_org_id());

create policy "edges_org_isolation" on public.edges
  for all using (org_id = public.current_org_id());

create policy "routes_org_isolation" on public.routes
  for all using (org_id = public.current_org_id());

create policy "explanations_org_isolation" on public.explanations
  for all using (org_id = public.current_org_id());

create policy "file_roles_org_isolation" on public.file_roles
  for all using (org_id = public.current_org_id());

create policy "insights_org_isolation" on public.insights
  for all using (org_id = public.current_org_id());
