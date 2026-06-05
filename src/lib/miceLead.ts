import { supabase } from "@/integrations/supabase/client";

export interface MiceLeadPayload {
  email: string;
  name?: string;
  severity?: number;
  species?: string;
}

export async function submitMiceLead(payload: MiceLeadPayload) {
  // 1. First, try to invoke the Edge Function
  try {
    const { data, error } = await supabase.functions.invoke("mice-elimination-lead", {
      body: payload,
    });
    
    if (!error) {
      return data;
    }
    console.error("Supabase edge function error, falling back to direct db insert:", error);
  } catch (err) {
    console.error("Failed to invoke edge function, falling back to direct db insert:", err);
  }

  // 2. Fallback: Direct Database Insert/Upsert
  const sourceTag = payload.species
    ? `quiz_gate_${payload.species.toLowerCase().replace(/\s+/g, '_')}_${payload.severity ?? 'unknown'}`
    : 'quiz_gate';

  const { data, error: dbError } = await supabase
    .from("email_subscribers")
    .upsert(
      {
        email: payload.email.trim().toLowerCase(),
        name: payload.name?.trim() || null,
        source: sourceTag,
      },
      { onConflict: "email" }
    )
    .select();

  if (dbError) {
    console.error("Fallback direct database insert failed:", dbError);
    throw new Error(dbError.message || 'Could not save subscriber lead.');
  }

  return { ok: true, message: "Saved to database (fallback)", data };
}
