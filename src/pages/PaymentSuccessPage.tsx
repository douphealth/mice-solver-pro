import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, Loader2, MailQuestion, RotateCw, XCircle } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { verifyPurchase } from "@/lib/api";
import { KEYS, writeJSON } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import { CONTACT_EMAIL } from "@/lib/sources";
import type { Entitlement } from "@/lib/pro-types";

type View = { kind: "verifying" } | { kind: "active"; entitlement: Entitlement } | { kind: "pending" } | { kind: "denied"; reason: string } | { kind: "error"; message: string } | { kind: "missing" };

const SESSION_RE = /^cs_(?:live|test)_[A-Za-z0-9]{10,200}$/;

/**
 * Stripe returns buyers here with ?session_id=. The id alone proves nothing: access is granted only after the
 * server confirms with Stripe that this session is a completed, paid and unrefunded purchase of the Pro product.
 */
export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id") ?? "";
  const [view, setView] = useState<View>(() => (SESSION_RE.test(sessionId) ? { kind: "verifying" } : { kind: "missing" }));

  const run = useCallback(async () => {
    if (!SESSION_RE.test(sessionId)) { setView({ kind: "missing" }); return; }
    setView({ kind: "verifying" });
    const res = await verifyPurchase(sessionId);
    if (res.ok && res.data.entitlement.active) {
      writeJSON(KEYS.pro, { sessionId, savedAt: new Date().toISOString() });
      trackEvent("pro_verified");
      setView({ kind: "active", entitlement: res.data.entitlement });
      return;
    }
    const reason = res.ok ? res.data.entitlement.reason : res.data?.entitlement?.reason;
    if (reason === "unpaid") setView({ kind: "pending" });
    else if (reason === "refunded" || reason === "wrong_product" || reason === "not_found") setView({ kind: "denied", reason });
    else setView({ kind: "error", message: res.ok ? "We couldn't verify this purchase right now." : res.message });
  }, [sessionId]);

  useEffect(() => { void run(); }, [run]);
  useEffect(() => {
    if (view.kind !== "active") return;
    const t = window.setTimeout(() => navigate("/pro", { replace: true }), 2500);
    return () => window.clearTimeout(t);
  }, [view, navigate]);

  return (
    <PageShell>
      <div className="container-read flex min-h-[60vh] items-center justify-center py-16">
        <div className="card-soft w-full max-w-xl p-8 text-center md:p-10" aria-live="polite">
          {view.kind === "verifying" && (<>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" aria-hidden="true" />
            <h1 className="mt-5 text-3xl font-bold">Confirming your payment</h1>
            <p className="mt-3 text-muted-foreground">We're checking with Stripe. This usually takes a few seconds. Please keep this page open.</p>
          </>)}

          {view.kind === "active" && (<>
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" aria-hidden="true" />
            <h1 className="mt-5 text-3xl font-bold">Payment confirmed. Welcome to Pro</h1>
            <p className="mt-3 text-muted-foreground">Your {view.entitlement.email ? `purchase for ${view.entitlement.email} is` : "purchase is"} verified. We're opening your workspace now. An access link has also been emailed so you can restore it on any device.</p>
            <Button asChild variant="premium" size="lg" className="mt-6"><Link to="/pro" replace>Open my Pro workspace</Link></Button>
          </>)}

          {view.kind === "pending" && (<>
            <Clock className="mx-auto h-14 w-14 text-[hsl(33_90%_42%)]" aria-hidden="true" />
            <h1 className="mt-5 text-3xl font-bold">Your payment is still processing</h1>
            <p className="mt-3 text-muted-foreground">Stripe hasn't marked this payment as complete yet. Some payment methods take a little while. We'll email your access link when it clears, or you can check again now.</p>
            <Button variant="default" size="lg" className="mt-6" onClick={() => void run()}><RotateCw className="h-4 w-4" aria-hidden="true" />Check again</Button>
          </>)}

          {view.kind === "denied" && (<>
            <XCircle className="mx-auto h-14 w-14 text-destructive" aria-hidden="true" />
            <h1 className="mt-5 text-3xl font-bold">{view.reason === "refunded" ? "This purchase was refunded" : "We couldn't confirm a Pro purchase"}</h1>
            <p className="mt-3 text-muted-foreground">{view.reason === "refunded" ? "Pro access ends when a payment is refunded. Your free plan and tools are unaffected." : "This link doesn't match a completed Pro purchase. If you did pay, restore your purchase with the email you used at checkout, or email us and we'll sort it out."}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3"><Button asChild variant="default"><Link to="/restore">Restore my purchase</Link></Button><Button asChild variant="outline"><a href={`mailto:${CONTACT_EMAIL}`}>Email support</a></Button></div>
          </>)}

          {view.kind === "error" && (<>
            <XCircle className="mx-auto h-14 w-14 text-[hsl(33_90%_42%)]" aria-hidden="true" />
            <h1 className="mt-5 text-3xl font-bold">We couldn't finish checking</h1>
            <p className="mt-3 text-muted-foreground">{view.message} If you've paid, you haven't lost anything: try again in a moment.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3"><Button variant="default" onClick={() => void run()}><RotateCw className="h-4 w-4" aria-hidden="true" />Try again</Button><Button asChild variant="outline"><Link to="/restore">Restore my purchase</Link></Button></div>
          </>)}

          {view.kind === "missing" && (<>
            <MailQuestion className="mx-auto h-14 w-14 text-primary" aria-hidden="true" />
            <h1 className="mt-5 text-3xl font-bold">No purchase reference found</h1>
            <p className="mt-3 text-muted-foreground">This page opens automatically after checkout. If you've already paid, use your emailed access link or restore your purchase.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3"><Button asChild variant="default"><Link to="/restore">Restore my purchase</Link></Button><Button asChild variant="outline"><Link to="/pro">See the Pro Masterplan</Link></Button></div>
          </>)}
        </div>
      </div>
    </PageShell>
  );
}
