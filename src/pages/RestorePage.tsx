import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Mail } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Callout } from "@/components/ui-kit";
import { requestRestore } from "@/lib/api";
import { CONTACT_EMAIL } from "@/lib/sources";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RestorePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [linkError, setLinkError] = useState("");

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setState("error"); setMessage("Enter the email address you used at checkout."); return; }
    setState("sending"); setMessage("");
    const res = await requestRestore(email.trim());
    setState(res.ok ? "sent" : "error"); setMessage(res.message);
  }

  function openLink(e: React.FormEvent) {
    e.preventDefault();
    const match = link.match(/session_id=(cs_(?:live|test)_[A-Za-z0-9]{10,200})/) ?? link.trim().match(/^(cs_(?:live|test)_[A-Za-z0-9]{10,200})$/);
    if (!match) { setLinkError("That doesn't look like an access link. Paste the full link from your confirmation email."); return; }
    setLinkError("");
    navigate(`/payment-success?session_id=${match[1]}`);
  }

  return (
    <PageShell>
      <div className="container-read py-12 md:py-16">
        <h1 className="text-3xl font-extrabold md:text-4xl">Restore your Pro purchase</h1>
        <p className="mt-3 text-lg text-muted-foreground">Bought the Pro Masterplan on another device or cleared your browser? Get back in with either option below.</p>

        <section className="card-soft mt-8 p-6 md:p-8" aria-labelledby="by-email">
          <h2 id="by-email" className="flex items-center gap-2 font-display text-xl font-bold"><Mail className="h-5 w-5 text-primary" aria-hidden="true" />Email me a new access link</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter the email you used at checkout. If we find a Pro purchase, we'll send a link to that address.</p>
          <form onSubmit={sendEmail} className="mt-4 flex flex-col gap-3 sm:flex-row" noValidate>
            <label className="sr-only" htmlFor="restore-email">Email used at checkout</label>
            <Input id="restore-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1" required />
            <Button type="submit" variant="default" size="lg" disabled={state === "sending"}>{state === "sending" ? "Sending..." : "Send link"}</Button>
          </form>
          <div aria-live="polite" className="mt-4">
            {state === "sent" && <Callout tone="success" title="Check your inbox">{message}</Callout>}
            {state === "error" && <Callout tone="safety" title="That didn't work">{message}</Callout>}
          </div>
        </section>

        <section className="card-soft mt-6 p-6 md:p-8" aria-labelledby="by-link">
          <h2 id="by-link" className="flex items-center gap-2 font-display text-xl font-bold"><KeyRound className="h-5 w-5 text-primary" aria-hidden="true" />I already have my access link</h2>
          <form onSubmit={openLink} className="mt-4 flex flex-col gap-3 sm:flex-row" noValidate>
            <label className="sr-only" htmlFor="restore-link">Access link</label>
            <Input id="restore-link" value={link} onChange={e => setLink(e.target.value)} placeholder="Paste the link from your email" className="flex-1" />
            <Button type="submit" variant="outline" size="lg">Open</Button>
          </form>
          {linkError && <p role="alert" className="mt-3 text-sm font-medium text-destructive">{linkError}</p>}
        </section>

        <p className="mt-8 text-sm text-muted-foreground">Still stuck? Email <a className="font-semibold text-primary underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the email you used at checkout. Not bought yet? <Link to="/pro" className="font-semibold text-primary underline">See the Pro Masterplan</Link>.</p>
      </div>
    </PageShell>
  );
}
