export interface MiceLeadPayload {
  email: string;
  name?: string;
  severity?: number;
  species?: string;
}

export async function submitMiceLead(payload: MiceLeadPayload) {
  const response = await fetch('/api/mice-elimination-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let body: { ok?: boolean; message?: string } = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok || body.ok === false) {
    throw new Error(body.message || 'Could not send your blueprint email.');
  }

  return body;
}
