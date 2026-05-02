-- ════════════════════════════════════════════════════════════════════
-- Access Model — Stage 4: current_user_access view
-- ════════════════════════════════════════════════════════════════════
-- Single endpoint the frontend calls to learn what the current user can
-- do. Returns at most one row (for auth.uid()).
--
-- Marked `security_invoker = true` so RLS on the underlying tables
-- (profiles, entitlements, section_members) still applies. That keeps
-- the view honest: a user can only see their own resolved row, even if
-- they query the view directly.
-- ════════════════════════════════════════════════════════════════════

drop view if exists public.current_user_access;

create view public.current_user_access
with (security_invoker = true)
as
select
  p.id                                                       as user_id,
  p.role,
  p.university_id,
  -- Premium
  coalesce(e_premium.active, p.premium_active, false)        as premium_active,
  p.premium_plan,
  p.premium_renews_at,
  e_premium.source                                           as premium_source,
  e_premium.expires_at                                       as premium_expires_at,
  -- Institution
  coalesce(e_inst.active, p.institution_covered, false)      as institution_covered,
  coalesce(p.institution_verified, false)                    as institution_verified,
  e_inst.source                                              as institution_source,
  e_inst.expires_at                                          as institution_expires_at,
  -- Professor
  coalesce(e_prof.active, false)                             as professor_workspace,
  coalesce(p.professor_verified, false)                      as professor_verified,
  p.professor_verified_at,
  -- Section signal
  exists (
    select 1
    from public.section_members sm
    where sm.user_id = p.id
  )                                                          as has_joined_section
from public.profiles p
left join public.entitlements e_premium
  on e_premium.user_id = p.id and e_premium.feature = 'premium'
left join public.entitlements e_inst
  on e_inst.user_id = p.id and e_inst.feature = 'institution_covered'
left join public.entitlements e_prof
  on e_prof.user_id = p.id and e_prof.feature = 'professor_workspace'
where p.id = auth.uid();

comment on view public.current_user_access is
  'Resolved access snapshot for the current authenticated user. Single-row read used by the frontend useAccess() hook. security_invoker keeps RLS on underlying tables in force.';

grant select on public.current_user_access to authenticated, anon;
