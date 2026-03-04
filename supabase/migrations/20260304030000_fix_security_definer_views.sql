-- Fix linter errors for SECURITY DEFINER views by forcing SECURITY INVOKER.

alter view if exists public.public_profiles_for_leaderboard
set (security_invoker = true);

alter view if exists public.user_recent_quiz_sets
set (security_invoker = true);
