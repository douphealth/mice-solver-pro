import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Crown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOOLS } from "@/lib/site";
import { ToolIcon } from "@/components/ToolIcon";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-foreground/75"}`;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { pathname } = useLocation();
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpen(false); setToolsOpen(false); }, [pathname]);
  useEffect(() => {
    if (!toolsOpen) return;
    const onDown = (e: MouseEvent) => { if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setToolsOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [toolsOpen]);

  return (
    <header className="relative z-30 border-b bg-background/95 backdrop-blur no-print">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 font-display text-xl font-bold text-foreground" aria-label="MiceGoneGuide planner home">
          <img src="/logo-96.png" width={36} height={36} alt="" className="h-9 w-9 rounded-full object-contain" />
          <span>MiceGone<span className="text-[hsl(33_90%_38%)]">Guide</span></span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          <NavLink to="/quiz" className={linkClass}>Free plan</NavLink>
          <div className="relative" ref={toolsRef}>
            <button type="button" aria-expanded={toolsOpen} aria-haspopup="true" onClick={() => setToolsOpen(v => !v)}
              className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${pathname.startsWith("/tools") ? "text-primary" : "text-foreground/75"}`}>
              Tools <ChevronDown className={`h-4 w-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
            </button>
            {toolsOpen && (
              <div className="absolute left-1/2 top-full z-40 mt-2 w-80 -translate-x-1/2 rounded-2xl border bg-card p-2 shadow-xl">
                {TOOLS.map(t => (
                  <Link key={t.to} to={t.to} className="flex gap-3 rounded-xl p-3 hover:bg-secondary">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><ToolIcon name={t.icon} className="h-4 w-4" /></span>
                    <span><span className="block text-sm font-semibold">{t.title}</span><span className="block text-xs leading-snug text-muted-foreground">{t.blurb}</span></span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/pro" className={linkClass}><span className="inline-flex items-center gap-1.5"><Crown className="h-3.5 w-3.5 text-[hsl(33_90%_42%)]" />Pro Masterplan</span></NavLink>
          <Button asChild variant="hero" size="sm" className="ml-3"><Link to="/quiz">Build my free plan</Link></Button>
        </nav>

        <button type="button" className="rounded-md p-2 text-foreground md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(v => !v)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile navigation" className="border-t bg-background md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            <Link to="/quiz" className="rounded-lg px-3 py-3 text-base font-semibold">Free plan</Link>
            <p className="eyebrow px-3 pt-2">Tools</p>
            {TOOLS.map(t => <Link key={t.to} to={t.to} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base"><ToolIcon name={t.icon} className="h-4 w-4 text-primary" />{t.title}</Link>)}
            <Link to="/pro" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-3 text-base font-semibold"><Crown className="h-4 w-4 text-[hsl(33_90%_42%)]" />Pro Masterplan</Link>
            <Button asChild variant="hero" size="lg" className="mt-2"><Link to="/quiz">Build my free plan</Link></Button>
          </div>
        </nav>
      )}
    </header>
  );
}
