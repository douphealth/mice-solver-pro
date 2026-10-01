import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FileText, Plus, LogOut, BarChart3 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => { if (!session) navigate("/auth"); else setUser(session.user); setLoading(false); });
    supabase.auth.getSession().then(({ data: { session } }) => { if (!session) navigate("/auth"); else setUser(session.user); setLoading(false); });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 container mx-auto px-4 py-10 max-w-4xl"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="flex items-center justify-between mb-8"><div><h1 className="text-3xl font-display font-bold text-foreground">Your Dashboard</h1><p className="text-sm text-muted-foreground mt-1">{user?.email}</p></div><Button variant="ghost" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" /> Sign Out</Button></div>
    <div className="grid md:grid-cols-2 gap-4 mb-10"><Link to="/quiz"><div className="glass-card rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"><Plus className="h-8 w-8 text-accent mb-3" /><h3 className="font-display font-semibold text-lg text-foreground mb-1">New Plan</h3><p className="text-sm text-muted-foreground">Start a new observation-based plan</p></div></Link><Link to="/tools/calculator"><div className="glass-card rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"><BarChart3 className="h-8 w-8 text-primary mb-3" /><h3 className="font-display font-semibold text-lg text-foreground mb-1">Observation Planner</h3><p className="text-sm text-muted-foreground">Organize observations and next steps</p></div></Link></div>
    <div className="glass-card rounded-2xl p-8 text-center"><FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="font-display font-semibold text-lg text-foreground mb-2">Download and keep your plan</h3><p className="text-sm text-muted-foreground mb-6">Generate a plan and download its PDF. This dashboard does not currently list saved reports.</p><Link to="/quiz"><Button variant="hero">Start Free Plan →</Button></Link></div>
  </motion.div></div><Footer /></div>;
}
