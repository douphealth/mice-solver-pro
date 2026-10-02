import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import PageShell from "@/components/layout/PageShell";
import { CONTACT_EMAIL } from "@/lib/sources";

const UPDATED = "2 October 2026";

function Doc({ title, children }: { title: string; children: ReactNode }) {
  return (
    <PageShell>
      <div className="container-read py-12 md:py-16">
        <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {UPDATED}</p>
        <div className="mt-8 space-y-8 leading-relaxed text-foreground/90 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline">{children}</div>
      </div>
    </PageShell>
  );
}

export function PrivacyPage() {
  return (
    <Doc title="Privacy">
      <section><h2>The short version</h2><p>The free planner works without an account, an email or any personal details. Your quiz answers, ticked steps, evidence log and access link stay in your browser's local storage on your device. They are not sent to us.</p></section>
      <section><h2>What is sent, and to whom</h2>
        <ul>
          <li><strong>Email check-ins (optional).</strong> If you subscribe, your name and email are sent to our email provider, Brevo, so we can send you planning emails. You can unsubscribe by replying "unsubscribe" to any email.</li>
          <li><strong>Pro purchases.</strong> Payment is handled by Stripe, so we never see your card details. After checkout, our server asks Stripe whether your purchase is complete and unrefunded, and uses the email on the purchase to send your access link.</li>
          <li><strong>Restore my purchase.</strong> The email you enter is used to look up your purchase with Stripe and to send an access link if one exists.</li>
          <li><strong>Hosting.</strong> The site runs on Cloudflare, which processes standard request data such as IP address to deliver pages and protect against abuse.</li>
          <li><strong>Links out.</strong> Source links go to CDC and UC IPM. Supply links go to Amazon search pages and carry our Associates tag.</li>
        </ul>
      </section>
      <section><h2>What is stored in your browser</h2><p>Quiz answers, checklist progress, trap layout, evidence log entries, your plan start date and, after a Pro purchase, your access link and a saved copy of your Pro content so it opens if you're offline. Clear your browser's site data to remove all of it. Export your evidence log to CSV first if you want to keep it.</p></section>
      <section><h2>Analytics and cookies</h2><p>We don't set cookies. Cloudflare, which hosts this site, may add its Web Analytics beacon, a cookieless measurement of page views and load performance that doesn't track you across sites. We run no other analytics, and none will be added without your consent.</p></section>
      <section><h2>Your choices</h2><p>To unsubscribe, delete your information or ask a question, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p></section>
    </Doc>
  );
}

export function TermsPage() {
  return (
    <Doc title="Terms and purchase information">
      <section><h2>What this planner is</h2><p>The Mouse Control Planner and the Pro Masterplan organise practical guidance from the CDC and UC IPM into checklists and schedules. They are not an inspection, a diagnosis, a count of mice, a disease assessment or professional pest-control, medical or electrical advice. They don't promise that mice will be removed or that a property will be free of rodents.</p></section>
      <section><h2>Safety</h2><p>Follow product labels and local rules. Keep traps and bait away from children, pets and wildlife. Don't handle damaged wiring, duct contamination or heavy contamination yourself. Use a qualified professional when a task is unsafe. Source organisations haven't reviewed or endorsed this planner.</p></section>
      <section><h2>The Pro Masterplan</h2>
        <ul>
          <li>It's a one-time digital purchase paid through Stripe at the price shown at checkout. It isn't a subscription.</li>
          <li>After payment, we confirm the purchase with Stripe and unlock an online workspace, which you can also download as a PDF. An access link is emailed to the address on the purchase.</li>
          <li>Access ends if the payment is refunded or reversed through Stripe.</li>
          <li>If something goes wrong with your order, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the email you used at checkout.</li>
          <li>Please don't share your access link. It's personal to your purchase.</li>
        </ul>
      </section>
      <section><h2>Affiliate links</h2><p>As an Amazon Associate, MiceGoneGuide earns from qualifying purchases. Supply links open Amazon search results, so you choose the product and see current prices there. Recommendations don't change with the commission.</p></section>
      <section><h2>No warranty</h2><p>The content is provided as general information, without warranties of any kind. Use of it is at your own risk. See also the <Link to="/privacy">privacy page</Link>.</p></section>
    </Doc>
  );
}
