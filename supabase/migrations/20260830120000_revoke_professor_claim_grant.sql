-- Take EXECUTE on claim_professor_verification_code away from anon and
-- authenticated.
--
-- The function is SECURITY DEFINER. It takes the user id to verify as a
-- caller-supplied parameter (professor_user_id_input) and never compares it
-- to auth.uid() -- it cannot, because its one legitimate caller is the
-- handle_new_user() trigger on auth.users, where there is no session yet.
-- With EXECUTE granted to anon, anyone holding an unused invite code and
-- the email it was issued to could call the RPC directly with any user id
-- and mark that account a verified professor at the university, then have
-- entitlements recomputed for it. No account of their own required.
--
-- handle_new_user() is itself SECURITY DEFINER, so it runs as the owner and
-- keeps EXECUTE implicitly. Nothing in the app calls this RPC -- the only
-- app-side call in the professor flow is to
-- validate_professor_verification_code, the read-only checker the signup
-- form uses, which legitimately stays granted to anon.
--
-- This restores the pattern the other privileged definer functions already
-- follow: grant_entitlement, recompute_entitlements and audit_record_event
-- are all revoked from public, anon and authenticated. This one was missed.

revoke all on function public.claim_professor_verification_code(uuid, text, text, uuid)
  from public, anon, authenticated;
