// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ApprovalPayload {
  token?: string;
  cid?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hash))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { error: "Function environment is not configured." });
  }

  const payload = (await request.json().catch(() => ({}))) as ApprovalPayload;
  const token = (payload.token || "").trim();
  const cid = (payload.cid || "").trim();
  if (!token || token.length < 24 || !cid || !isUuid(cid)) {
    return json(400, { error: "Invalid approval token." });
  }

  const pepper = Deno.env.get("IP_APPROVAL_PEPPER") || "";
  const tokenHash = await sha256Hex(`${token}::${pepper}`);
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: challenge, error: challengeError } = await adminClient
    .from("login_ip_challenges")
    .select("id, user_id, ip_hash, expires_at, used_at")
    .eq("id", cid)
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (challengeError || !challenge) {
    return json(400, { error: "This approval link is invalid or expired." });
  }

  if (challenge.used_at) {
    return json(400, { error: "This approval link has already been used." });
  }

  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    return json(400, { error: "This approval link has expired." });
  }

  const { error: challengeUpdateError } = await adminClient
    .from("login_ip_challenges")
    .update({ used_at: new Date().toISOString() })
    .eq("id", challenge.id)
    .is("used_at", null);

  if (challengeUpdateError) {
    return json(500, { error: "Unable to complete approval." });
  }

  const nowIso = new Date().toISOString();
  const { data: existingAllow } = await adminClient
    .from("login_ip_allowlist")
    .select("user_id, ip_hash, approved_at")
    .eq("user_id", challenge.user_id)
    .eq("ip_hash", challenge.ip_hash)
    .maybeSingle();

  if (existingAllow) {
    const { error: updateAllowError } = await adminClient
      .from("login_ip_allowlist")
      .update({
        approved: true,
        approved_at: existingAllow.approved_at || nowIso,
        last_seen_at: nowIso
      })
      .eq("user_id", challenge.user_id)
      .eq("ip_hash", challenge.ip_hash);

    if (updateAllowError) {
      return json(500, { error: "Unable to update trusted IP." });
    }
  } else {
    const { error: insertAllowError } = await adminClient.from("login_ip_allowlist").insert({
      user_id: challenge.user_id,
      ip_hash: challenge.ip_hash,
      approved: true,
      approved_at: nowIso,
      first_seen_at: nowIso,
      last_seen_at: nowIso
    });

    if (insertAllowError) {
      return json(500, { error: "Unable to save trusted IP." });
    }
  }

  try {
    await adminClient.from("audit_log").insert({
      user_id: challenge.user_id,
      event_type: "login_ip_approved",
      metadata: {
        challenge_id: challenge.id,
        ip_hash: challenge.ip_hash
      },
      created_at: nowIso
    });
  } catch {
    // audit_log is optional.
  }

  return json(200, {
    ok: true,
    ipHash: challenge.ip_hash
  });
});
