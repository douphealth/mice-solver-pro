import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { User as AuthUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const location = useLocation();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => { setUser(session?.user ?? null); });
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);
  const links = [ { to: "/", label: "Home" }, { to: "/quiz", label: "Free Planner" }, { to: "/tools/calculator", label: "Action Planner" }, { to: "/tools/entry-points", label: "Entry Points" } ];
  return (
    <nav className="relative z-20 bg-background border-b border-border" aria-label="Main navigation">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-foreground"><img src="/logo.png" alt="MiceGoneGuide logo" className="h-8 w-8 object-contain" /><span>MiceGone<span className="text-accent">Guide</span></span></Link>
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => <Link key={l.to} to={l.to} className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === l.to ? "text-primary" : "text-muted-foreground"}`}>{l.label}</Link>)}
          {user ? <Link to="/dashboard"><Button variant="outline" size="sm"><User className="h-4 w-4 mr-1" /> Dashboard</Button></Link> : <Link to="/auth"><Button variant="ghost" size="sm">Sign In</Button></Link>}
          <Link to="/quiz"><Button variant="hero" size="sm">Start Free Quiz →</Button></Link>
        </div>
        <button type="button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} aria-controls="mobile-navigation" className="md:hidden text-foreground p-3" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
      </div>
      <AnimatePresence>{mobileOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} id="mobile-navigation" className="md:hidden overflow-hidden bg-background border-b border-border"><div className="flex flex-col gap-2 p-4">
        {links.map(l => <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className={`py-2 text-sm font-medium ${location.pathname === l.to ? "text-primary" : "text-muted-foreground"}`}>{l.label}</Link>)}
        {user ? <Link to="/dashboard" onClick={() => setMobileOpen(false)}><Button variant="outline" className="w-full">Dashboard</Button></Link> : <Link to="/auth" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full">Sign In</Button></Link>}
        <Link to="/quiz" onClick={() => setMobileOpen(false)}><Button variant="hero" className="w-full mt-2">Start Free Quiz →</Button></Link>
      </div></motion.div>}</AnimatePresence>
    </nav>
  );
}
