import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitMiceLead } from "@/lib/miceLead";

export default function EmailCaptureModal({ open, onSuccess }: { open: boolean; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  if (!open) return null;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!consent || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email and select the subscription checkbox."); return; }
    setLoading(true); setError("");
    try { await submitMiceLead({ email: email.trim().toLowerCase(), name: name.trim() || undefined }); onSuccess(); }
    catch { setError("We could not save your request. Your plan and PDF remain available without subscribing."); }
    finally { setLoading(false); }
  }
  return <section className="glass-card rounded-2xl p-6" aria-labelledby="email-heading"><h2 id="email-heading" className="text-xl font-semibold mb-3">Optional email check-ins</h2><p className="text-sm mb-4">Your plan is already available. Email check-ins are general reminders, not a diagnosis or a clearance guarantee.</p><form onSubmit={submit} className="space-y-4">
    <label className="block text-sm">Name (optional)<Input autoComplete="given-name" value={name} maxLength={100} onChange={e => setName(e.target.value)}/></label>
    <label className="block text-sm">Email<Input type="email" autoComplete="email" value={email} maxLength={255} required onChange={e => setEmail(e.target.value)}/></label>
    <label className="flex gap-3 text-sm"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/>Send me mouse-control planning emails. This submits my name and email to the site's email service.</label>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" disabled={loading || !consent}>{loading ? "Saving request..." : "Request email check-ins"}</Button>
  </form></section>;
}
