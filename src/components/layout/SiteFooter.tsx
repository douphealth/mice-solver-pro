import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { TOOLS } from "@/lib/site";
import { CONTACT_EMAIL, GUIDES, SOURCES } from "@/lib/sources";

export default function SiteFooter() {
  return (
    <footer className="mt-auto bg-hero text-primary-foreground no-print">
      <div className="h-1 bg-accent-gradient" />
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <img src="/logo-96.png" width={36} height={36} alt="" className="h-9 w-9 rounded-full object-contain" />
              <span className="font-display text-xl font-bold">MiceGoneGuide</span>
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/80">Practical, source-backed planning for mouse problems at home. A planning aid, not an inspection, diagnosis or medical assessment.</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-4 inline-flex items-center gap-2 text-sm text-primary-foreground/90 underline-offset-4 hover:underline"><Mail className="h-4 w-4" />{CONTACT_EMAIL}</a>
          </div>
          <nav aria-label="Planner and tools">
            <h2 className="mb-4 font-body text-sm font-semibold uppercase tracking-wider text-accent">Planner & tools</h2>
            <ul className="space-y-2.5 text-sm text-primary-foreground/85">
              <li><Link className="hover:text-primary-foreground hover:underline" to="/quiz">Free plan builder</Link></li>
              {TOOLS.map(t => <li key={t.to}><Link className="hover:text-primary-foreground hover:underline" to={t.to}>{t.title}</Link></li>)}
              <li><Link className="hover:text-primary-foreground hover:underline" to="/pro">Pro Masterplan</Link></li>
              <li><Link className="hover:text-primary-foreground hover:underline" to="/restore">Restore my purchase</Link></li>
            </ul>
          </nav>
          <nav aria-label="Guides on MiceGoneGuide.com">
            <h2 className="mb-4 font-body text-sm font-semibold uppercase tracking-wider text-accent">Guides</h2>
            <ul className="space-y-2.5 text-sm text-primary-foreground/85">
              {GUIDES.map(g => <li key={g.url}><a className="hover:text-primary-foreground hover:underline" href={g.url}>{g.label}</a></li>)}
            </ul>
          </nav>
          <nav aria-label="Sources and policies">
            <h2 className="mb-4 font-body text-sm font-semibold uppercase tracking-wider text-accent">Sources & trust</h2>
            <ul className="space-y-2.5 text-sm text-primary-foreground/85">
              {SOURCES.map(s => <li key={s.id}><a className="hover:text-primary-foreground hover:underline" href={s.url} rel="noopener noreferrer">{s.label}</a></li>)}
              <li><Link className="hover:text-primary-foreground hover:underline" to="/privacy">Privacy</Link></li>
              <li><Link className="hover:text-primary-foreground hover:underline" to="/terms">Terms & purchase info</Link></li>
            </ul>
          </nav>
        </div>
        <div className="mt-10 border-t border-primary-foreground/15 pt-6 text-xs leading-relaxed text-primary-foreground/70">
          <p>&copy; {new Date().getFullYear()} MiceGoneGuide. Source organizations haven't reviewed or endorsed this planner. Call a qualified professional when inspection, cleanup or building work is unsafe. As an Amazon Associate, MiceGoneGuide earns from qualifying purchases.</p>
        </div>
      </div>
    </footer>
  );
}
