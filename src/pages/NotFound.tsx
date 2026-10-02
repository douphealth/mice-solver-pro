import { Link } from "react-router-dom";
import { ArrowRight, SearchX } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { TOOLS } from "@/lib/site";

export default function NotFound() {
  return (
    <PageShell>
      <div className="container-read py-20 text-center">
        <SearchX className="mx-auto h-14 w-14 text-primary" aria-hidden="true" />
        <h1 className="mt-5 text-4xl font-extrabold">That page doesn't exist</h1>
        <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">The link may be old or mistyped. Here's where most people want to go.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild variant="hero" size="lg"><Link to="/quiz">Build my free plan<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
          <Button asChild variant="outline" size="lg"><Link to="/">Back to home</Link></Button>
        </div>
        <ul className="mx-auto mt-10 grid max-w-xl gap-2 text-left sm:grid-cols-2">{TOOLS.map(t => <li key={t.to}><Link to={t.to} className="block rounded-xl border bg-card p-3.5 font-semibold text-primary hover:bg-secondary">{t.title}</Link></li>)}</ul>
      </div>
    </PageShell>
  );
}
