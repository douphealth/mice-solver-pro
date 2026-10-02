import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/** Dark page header used by the free tools, with a breadcrumb for orientation. */
export default function ToolHeader({ title, children, crumb }: { title: string; children?: ReactNode; crumb: string }) {
  return (
    <header className="bg-hero hero-pattern text-primary-foreground">
      <div className="container-page py-10 md:py-14">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-primary-foreground/70">
          <Link to="/" className="hover:text-primary-foreground hover:underline">Planner</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Free tools</span>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span aria-current="page" className="text-primary-foreground">{crumb}</span>
        </nav>
        <h1 className="max-w-3xl text-3xl font-extrabold leading-[1.12] md:text-5xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-lg leading-relaxed text-primary-foreground/85">{children}</div>}
      </div>
    </header>
  );
}
