import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Shield, ArrowRight, X, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmailCaptureModal({ open, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await supabase.from("email_subscribers").insert({
        email: email.trim().toLowerCase(),
        name: name.trim() || null,
        source: "quiz_gate",
      });
    } catch {
      // Non-blocking — still show results even if DB insert fails
    }
    setLoading(false);
    onSuccess();
  };

  const handleSkip = () => {
    onSuccess();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
          >
            {/* Top accent */}
            <div className="h-1.5 bg-accent-gradient" />

            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Mail className="h-7 w-7 text-primary" />
              </div>

              <h2 className="text-2xl font-display font-bold text-foreground text-center mb-2">
                Your Report is Ready!
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                Enter your email to unlock your personalized diagnostic report and receive expert mouse elimination tips.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                  maxLength={100}
                />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="h-12"
                  required
                  maxLength={255}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {loading ? "Loading..." : "View My Free Report"}
                </Button>
              </form>

              <button
                onClick={handleSkip}
                className="w-full text-center text-xs text-muted-foreground mt-4 hover:text-foreground transition-colors"
              >
                Skip — show me my report
              </button>

              <div className="flex items-center justify-center gap-4 mt-5 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  No spam, ever
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Unsubscribe anytime
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
