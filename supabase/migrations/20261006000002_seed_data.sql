-- Seed data for two organizations to verify RLS filtering

-- Insert organizations
insert into public.organizations (id, name)
values
  ('org_3KLEYKmoQSqMTODFAt1DkZDVzPn', 'lucifer-a7''s Team'),
  ('org_2ABC123TestTeam', 'Secondary Engineering Team')
on conflict (id) do update set name = excluded.name;

-- Seed project for primary team
insert into public.projects (id, org_id, name, repo_url)
values
  ('11111111-1111-1111-1111-111111111111', 'org_3KLEYKmoQSqMTODFAt1DkZDVzPn', 'cartograph', 'https://github.com/lucifer-kj/cartograph')
on conflict (id) do nothing;

-- Seed analyses for primary team
insert into public.analyses (id, org_id, project_id, commit_hash, status, stage, created_at, updated_at)
values
  ('22222222-2222-2222-2222-222222222222', 'org_3KLEYKmoQSqMTODFAt1DkZDVzPn', '11111111-1111-1111-1111-111111111111', '159b025', 'complete', 'store', now() - interval '2 hours', now() - interval '2 hours'),
  ('33333333-3333-3333-3333-333333333333', 'org_3KLEYKmoQSqMTODFAt1DkZDVzPn', '11111111-1111-1111-1111-111111111111', '0cf54bd', 'parsing', 'parse', now() - interval '10 minutes', now() - interval '10 minutes')
on conflict (id) do nothing;

-- Seed project for secondary team
insert into public.projects (id, org_id, name, repo_url)
values
  ('44444444-4444-4444-4444-444444444444', 'org_2ABC123TestTeam', 'acme-backend', 'https://github.com/acme/backend')
on conflict (id) do nothing;

-- Seed analysis for secondary team
insert into public.analyses (id, org_id, project_id, commit_hash, status, stage, created_at, updated_at)
values
  ('55555555-5555-5555-5555-555555555555', 'org_2ABC123TestTeam', '44444444-4444-4444-4444-444444444444', 'a1b2c3d', 'complete', 'store', now() - interval '1 day', now() - interval '1 day')
on conflict (id) do nothing;
