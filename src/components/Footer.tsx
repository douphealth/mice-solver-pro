import { Bug } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-display font-bold text-xl mb-3">
              <Bug className="h-5 w-5" />
              MiceGoneGuide
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              AI-powered mouse problem diagnosis and personalized elimination plans. Professional-grade pest control guidance for everyone.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Free Tools</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <Link to="/quiz" className="hover:text-primary-foreground transition-colors">Diagnostic Quiz</Link>
              <Link to="/tools/calculator" className="hover:text-primary-foreground transition-colors">Infestation Calculator</Link>
              <Link to="/tools/entry-points" className="hover:text-primary-foreground transition-colors">Entry Point Finder</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Resources</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <a href="https://micegoneguide.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">Blog — MiceGoneGuide.com</a>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} MiceGoneGuide. For informational purposes only. Consult a licensed pest control professional for severe infestations.
        </div>
      </div>
    </footer>
  );
}
