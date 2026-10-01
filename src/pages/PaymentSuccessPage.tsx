import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export default function PaymentSuccessPage() {
  return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center px-4 py-20"><motion.div className="glass-card-elevated rounded-2xl p-10 text-center max-w-lg w-full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
    <h1 className="text-3xl font-display font-bold text-foreground mb-3">Checkout Return</h1><p className="text-muted-foreground mb-8 leading-relaxed">Returning to this page alone does not verify payment or paid access. Check your Stripe receipt and contact MiceGoneGuide if paid access is missing.</p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center"><Link to="/quiz"><Button variant="premium" size="lg" className="gap-2 w-full sm:w-auto">Return to Planner</Button></Link><Link to="/"><Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">Back to Home<ArrowRight className="h-4 w-4" /></Button></Link></div>
  </motion.div></div><Footer /></div>;
}
