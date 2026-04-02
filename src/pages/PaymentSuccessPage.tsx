import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          className="glass-card-elevated rounded-2xl p-10 text-center max-w-lg w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Thank you for upgrading to the Pro Elimination Masterplan. Your full personalized report is now unlocked.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/report">
              <Button variant="premium" size="lg" className="gap-2 w-full sm:w-auto">
                <Download className="h-4 w-4" />
                View Full Report
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                Back to Home
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
