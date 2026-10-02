import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, BadgeCheck, CreditCard, Loader2, LockKeyhole, RotateCw, ShieldCheck, Sparkles } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import ProWorkspace from "@/components/pro/ProWorkspace";
import { PRO_FEATURES } from "@/components/ProPromo";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Callout, ScopeNote, SectionHeading } from "@/components/ui-kit";
import { usePro } from "@/hooks/use-pro";
import { CHECKOUT_URL, PRO_NAME, PRO_PRICE_LABEL, checkoutAvailable } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { CONTACT_EMAIL } from "@/lib/sources";

const HOW = [
  { icon: CreditCard, title: "Pay securely on Stripe", body: `${PRO_PRICE_LABEL} once. Stripe handles your card, and we never see it.` },
  { icon: ShieldCheck, title: "We confirm it with Stripe", body: "You're returned here and we check the payment directly with Stripe before unlocking anything." },
  { icon: BadgeCheck, title: "Your workspace opens", body: "An access link is also emailed so you can restore it on any device." },
];

const FAQ = [
  { q: "What exactly do I get?", a: "A private online workspace: a dated 30-day schedule tailored to your answers, full room-by-room protocols, a trap layout helper, an evidence log with a weekly chart, a sealing materials guide, a supply checklist, a when-to-call-a-pro kit, a prevention calendar and a printable PDF workbook." },
  { q: "Is this a subscription?", a: "No. It's a single payment. There's nothing to cancel." },
  { q: "Will it get rid of my mice?", a: "We can't promise results, and nobody honestly can. Pro organises the approaches the CDC and UC IPM describe so they're easier to carry out consistently. If signs continue, the workspace shows you when and how to bring in a professional." },
  { q: "How do I get back in on another phone or computer?", a: "Use the access link in your confirmation email, or the Restore my purchase page with the email you paid with." },
  { q: "Something went wrong with my order.", a: `Email ${CONTACT_EMAIL} with the email address you used at checkout and we'll help.` },
];

function Sample() {
  return (
    <div className="grid gap-5 md:grid-cols-3" aria-label="Sample of the workspace">
      <div className="card-soft p-5">
        <p className="pill mb-3">Sample · 30-day plan</p>
        <p className="font-display text-lg font-bold">Day 1: Lock down food and set the first traps</p>
        <ul className="mt-3 space-y-2 text-sm">{["Move food into thick containers with tight lids", "Set snap traps against walls, bait end to the wall", "Use only a small amount of bait"].map(t => <li key={t} className="flex gap-2"><span className="check-box !h-5 !w-5" aria-hidden="true" />{t}</li>)}</ul>
      </div>
      <div className="card-soft p-5">
        <p className="pill mb-3">Sample · Trap layout</p>
        <p className="font-display text-lg font-bold">Kitchen wall, 24 ft</p>
        <p className="mt-2 text-sm text-muted-foreground">Spacing no more than about 10 feet apart gives 3 positions:</p>
        <p className="mt-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">4, 12 and 20 ft along the wall</p>
      </div>
      <div className="card-soft p-5">
        <p className="pill mb-3">Sample · Evidence log</p>
        <svg viewBox="0 0 200 90" className="w-full" role="img" aria-label="Sample bar chart showing fewer recorded signs each week"><g fill="hsl(152 48% 28%)">{[60, 48, 36, 18, 8, 0].map((h, i) => <rect key={i} x={12 + i * 30} y={78 - h} width="20" height={Math.max(h, 2)} rx="3" opacity={h === 0 ? 0.25 : 1} />)}</g></svg>
        <p className="mt-2 text-xs text-muted-foreground">Illustrative data. Your chart shows what you record.</p>
      </div>
    </div>
  );
}

export default function ProPage() {
  const pro = usePro();
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => { void checkoutAvailable().then(setAvailable); }, []);

  if (pro.status === "active") return <PageShell><ProWorkspace pro={pro} /></PageShell>;

  // Never sell what the server can't yet unlock: the button appears only while purchase verification is available.
  const buy = available === false ? (
    <div className="rounded-xl border border-dashed bg-secondary/60 p-4 text-sm leading-relaxed" role="status" data-testid="checkout-unavailable">
      <p className="font-semibold">Pro checkout is being finalised</p>
      <p className="mt-1 text-muted-foreground">We pause sales whenever we can't instantly confirm and unlock a purchase. Your free plan and tools are fully available now. Please check back soon.</p>
      <Button asChild variant="default" size="sm" className="mt-3"><Link to="/quiz">Build my free plan</Link></Button>
    </div>
  ) : (
    <Button asChild variant="premium" size="xl">
      <a href={CHECKOUT_URL} onClick={() => trackEvent("checkout_started")} data-testid="checkout-link">Get the {PRO_NAME} · {PRO_PRICE_LABEL}<ArrowRight className="h-5 w-5" aria-hidden="true" /></a>
    </Button>
  );

  return (
    <PageShell>
      <header className="bg-hero hero-pattern text-primary-foreground">
        <div className="container-page grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow mb-3 flex items-center gap-2 !text-accent"><Sparkles className="h-4 w-4" aria-hidden="true" />Optional upgrade</p>
            <h1 className="text-4xl font-extrabold leading-[1.1] md:text-5xl">The {PRO_NAME}: your 30-day mouse control workspace</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-primary-foreground/85">Turn the free plan into a dated, tick-as-you-go programme with room protocols, a trap layout helper and an evidence log. Built on CDC and UC IPM guidance.</p>
          </div>
          <div className="rounded-3xl bg-card p-7 text-foreground shadow-2xl">
            <p className="text-sm font-semibold text-muted-foreground">One-time payment</p>
            <p className="mt-1 font-display text-5xl font-extrabold">{PRO_PRICE_LABEL}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {["Instant access after payment is confirmed", "No subscription, nothing to cancel", "Your free plan stays free", "Access link emailed to restore on any device"].map(t => <li key={t} className="flex gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />{t}</li>)}
            </ul>
            <div className="mt-6">{buy}</div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />Secure checkout by Stripe. We never see your card.</p>
            <p className="mt-3 text-sm">Already purchased? <Link to="/restore" className="font-semibold text-primary underline">Restore my purchase</Link></p>
          </div>
        </div>
      </header>

      <div className="container-page pt-8" aria-live="polite">
        {pro.status === "checking" && <Callout tone="info" title="Checking your purchase"><span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Confirming with Stripe...</span></Callout>}
        {pro.status === "denied" && <Callout tone="safety" title="We couldn't unlock Pro with that link">{pro.message} If you think this is a mistake, <Link to="/restore" className="font-semibold underline">restore your purchase</Link> or email {CONTACT_EMAIL}.</Callout>}
        {pro.status === "error" && <Callout tone="note" title="We couldn't reach the payment service">{pro.message} <button type="button" onClick={() => void pro.refresh()} className="inline-flex items-center gap-1 font-semibold underline"><RotateCw className="h-3.5 w-3.5" aria-hidden="true" />Try again</button></Callout>}
      </div>

      <section className="section-y container-page" aria-labelledby="inside-title">
        <SectionHeading id="inside-title" eyebrow="What's inside" title="Everything you need to carry the plan through" align="center" />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRO_FEATURES.map(f => (
            <li key={f.title} className="card-soft card-lift p-6">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><f.icon className="h-6 w-6" aria-hidden="true" /></span>
              <h3 className="text-lg font-bold">{f.title}</h3><p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-secondary/50 section-y" aria-labelledby="look-title">
        <div className="container-page">
          <SectionHeading id="look-title" eyebrow="A quick look" title="What it looks like inside" align="center" />
          <Sample />
        </div>
      </section>

      <section className="section-y container-page" aria-labelledby="how-pro">
        <SectionHeading id="how-pro" eyebrow="How buying works" title="Pay, confirm, unlock" align="center" />
        <ol className="grid gap-6 md:grid-cols-3">
          {HOW.map((h, i) => (
            <li key={h.title} className="card-soft p-6"><div className="mb-4 flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><h.icon className="h-5 w-5" aria-hidden="true" /></span><span className="font-display text-4xl font-extrabold text-primary/10">{i + 1}</span></div><h3 className="text-lg font-bold">{h.title}</h3><p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{h.body}</p></li>
          ))}
        </ol>
        <div className="mt-8 flex flex-col items-center gap-3">{buy}<ScopeNote className="max-w-2xl text-center" /></div>
      </section>

      <section className="bg-secondary/50 section-y" aria-labelledby="pro-faq">
        <div className="container-read">
          <SectionHeading id="pro-faq" eyebrow="Questions" title="Before you buy" align="center" />
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`} className="card-soft border px-5"><AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">{f.q}</AccordionTrigger><AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">{f.a}</AccordionContent></AccordionItem>
            ))}
          </Accordion>
          <p className="mt-6 flex items-start gap-2 text-sm text-muted-foreground"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />See the <Link to="/terms" className="font-semibold text-primary underline">terms and purchase information</Link> and <Link to="/privacy" className="font-semibold text-primary underline">privacy page</Link>.</p>
        </div>
      </section>
    </PageShell>
  );
}
