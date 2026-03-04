import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LEGAL_VERSION } from "@/lib/auth/legal";
import { getClientIp, hashIpForStorage, userAgentSnippet } from "@/lib/auth/ip-protection";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const ipRaw = getClientIp(request.headers);
  const ipHash = ipRaw ? await hashIpForStorage(ipRaw) : null;
  const userAgent = userAgentSnippet(request.headers.get("user-agent"));

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      privacy_version_accepted: LEGAL_VERSION,
      terms_version_accepted: LEGAL_VERSION
    })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const { error: consentError } = await supabase.from("legal_consents").upsert(
    [
      {
        user_id: user.id,
        doc_type: "privacy",
        doc_version: LEGAL_VERSION,
        ip_hash: ipHash,
        user_agent: userAgent
      },
      {
        user_id: user.id,
        doc_type: "terms",
        doc_version: LEGAL_VERSION,
        ip_hash: ipHash,
        user_agent: userAgent
      }
    ],
    {
      onConflict: "user_id,doc_type,doc_version",
      ignoreDuplicates: true
    }
  );

  if (consentError) {
    return NextResponse.json({ error: consentError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, version: LEGAL_VERSION });
}
