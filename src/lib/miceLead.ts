import { supabase } from "@/integrations/supabase/client";

export interface MiceLeadPayload {
  email: string;
  name?: string;
  severity?: number;
  species?: string;
}

export async function submitMiceLead(payload: MiceLeadPayload) {
  const { data, error } = await supabase.functions.invoke("mice-elimination-lead", {
    body: payload,
  });

  if (error) {
    console.error("Supabase edge function error:", error);
    throw new Error(error.message || 'Could not send your blueprint email.');
  }

  return data;
}
