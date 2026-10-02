import { useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLead } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailOptIn({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot: real visitors never see or fill this
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim()) || !consent) {
      setState("error"); setMessage("Enter a valid email address and tick the box to subscribe.");
      return;
    }
    setState("sending"); setMessage("");
    const res = await submitLead({ email: email.trim(), name: name.trim() || undefined, consent: true, website });
    if (res.ok) { setState("done"); setMessage(res.message); trackEvent("email_captured"); }
    else { setState("error"); setMessage(res.message); }
  }

  if (state === "done") {
    return (
      <div className={`card-soft p-6 ${className}`} role="status">
        <p className="flex items-center gap-2 font-display text-xl font-bold"><CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />You're on the list</p>
        <p className="mt-2 text-sm text-muted-foreground">{message} Your plan and PDF stay available here either way.</p>
      </div>
    );
  }

  return (
    <section className={`card-soft p-6 md:p-8 ${className}`} aria-labelledby="optin-title">
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><BellRing className="h-5 w-5" aria-hidden="true" /></span>
        <div>
          <h2 id="optin-title" className="text-xl font-bold">Optional email check-ins</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">General reminders for the first month: cleanup safety, trap checks and sealing. Your plan is already complete without this, and you can unsubscribe by replying to any email.</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
        <label className="block text-sm font-medium">Name (optional)
          <Input className="mt-1.5" autoComplete="given-name" value={name} maxLength={100} onChange={e => setName(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Email
          <Input className="mt-1.5" type="email" inputMode="email" autoComplete="email" value={email} maxLength={254} required onChange={e => setEmail(e.target.value)} />
        </label>
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label>
        </div>
        <label className="flex items-start gap-3 text-sm sm:col-span-2">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[hsl(152_48%_21%)]" checked={consent} onChange={e => setConsent(e.target.checked)} />
          <span>Send me MiceGoneGuide planning emails. This sends my email and name to our email provider (Brevo). See the <Link to="/privacy" className="font-semibold text-primary underline">privacy page</Link>.</span>
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" variant="default" size="lg" disabled={state === "sending"}>{state === "sending" ? "Saving..." : "Send me check-ins"}</Button>
          {state === "error" && <p role="alert" className="mt-3 text-sm font-medium text-destructive">{message}</p>}
        </div>
      </form>
    </section>
  );
}
