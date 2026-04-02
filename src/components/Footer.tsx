import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-hero text-primary-foreground mt-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(152_45%_30%/0.2),transparent_50%)]" />
      
      {/* Gold accent line */}
      <div className="h-0.5 bg-accent-gradient" />

      <div className="container mx-auto px-4 py-14 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 font-display font-bold text-xl mb-3">
              <img src="/logo.png" alt="MiceGoneGuide" className="h-8 w-8 object-contain" />
              MiceGone<span className="text-accent">Guide</span>
            </div>
            <p className="text-primary-foreground/50 text-sm leading-relaxed max-w-sm">
              Professional-grade mouse elimination guidance powered by AI. Trusted by 12,000+ homeowners to diagnose and solve their rodent problems.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/70">Free Tools</h4>
            <div className="flex flex-col gap-2.5 text-sm text-primary-foreground/50">
              <Link to="/quiz" className="hover:text-primary-foreground transition-colors">Diagnostic Quiz</Link>
              <Link to="/tools/calculator" className="hover:text-primary-foreground transition-colors">Infestation Calculator</Link>
              <Link to="/tools/entry-points" className="hover:text-primary-foreground transition-colors">Entry Point Finder</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/70">Resources</h4>
            <div className="flex flex-col gap-2.5 text-sm text-primary-foreground/50">
              <a href="https://micegoneguide.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">Blog</a>
              <a href="https://micegoneguide.com/mouse-identification-guide/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">Mouse ID Guide</a>
              <a href="https://micegoneguide.com/mouse-proof-your-home/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">Home Proofing Guide</a>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-xs text-primary-foreground/30">
          &copy; {new Date().getFullYear()} MiceGoneGuide. For informational purposes only. Consult a licensed pest control professional for severe infestations.
        </div>
      </div>
    </footer>
  );
}
