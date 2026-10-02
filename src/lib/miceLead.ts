import { supabase } from "@/integrations/supabase/client";
export interface MiceLeadPayload { email: string; name?: string; }
export async function submitMiceLead(payload: MiceLeadPayload) {
  const safe = { email: payload.email.trim().toLowerCase(), name: payload.name?.trim() || undefined };
  try {
    const { data, error } = await supabase.functions.invoke("mice-elimination-lead", { body: safe });
    if (!error && data?.ok === true) return data;
  } catch { /* A storage fallback is not a claim of email delivery. */ }
  const { error } = await supabase.from("email_subscribers").upsert({ email: safe.email, name: safe.name || null, source: "planner_optin" }, { onConflict: "email" });
  if (error) throw new Error("Could not save subscriber request.");
  return { ok: true, email_sent: false, message: "Request saved; email delivery not confirmed." };
}
