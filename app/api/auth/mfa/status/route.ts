import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface MfaFactor {
  status?: string;
}

interface MfaListResponse {
  data?: {
    all?: MfaFactor[];
    totp?: MfaFactor[];
  };
  error?: {
    message?: string;
  };
}


export async function POST() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authWithMfa = supabase.auth as unknown as {
    mfa?: {
      listFactors?: () => Promise<MfaListResponse>;
    };
  };

  if (typeof authWithMfa.mfa?.listFactors !== "function") {
    return NextResponse.json({ error: "MFA is not available for this session." }, { status: 400 });
  }

  const result = await authWithMfa.mfa.listFactors();
  if (result.error) {
    return NextResponse.json(
      { error: result.error.message || "Unable to load MFA factors." },
      { status: 400 }
    );
  }

  const allFactors = result.data?.all ?? result.data?.totp ?? [];
  const mfaEnabled = allFactors.some((factor) => factor.status === "verified");

  const { error: syncError } = await supabase.rpc("sync_my_mfa_status", {
    enabled_input: mfaEnabled
  });

  if (syncError) {
    return NextResponse.json({ error: syncError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, mfaEnabled });
}
