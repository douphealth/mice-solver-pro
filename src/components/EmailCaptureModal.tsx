import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowRight, CheckCircle2, Loader2, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitMiceLead } from "@/lib/miceLead";

interface Props {
  open: boolean;
  onSuccess: () => void;
  severity?: number;
  species?: string;
}

export default function EmailCaptureModal({ open, onSuccess, severity, species }: Props) {
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
      await submitMiceLead({
        email: email.trim().toLowerCase(),
        name: name.trim() || undefined,
        severity,
        species,
      });
    } catch (err) {
      console.error("MiceGoneGuide lead capture failed", err);
      setError("We couldn't send your blueprint yet. Please try again in a moment.");
      setLoading(false);
      return;
    }
    setLoading(false);
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

            <div className="p-8">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>

              <h2 className="text-2xl font-display font-bold text-foreground text-center mb-2">
                Your Mouse Elimination Blueprint is Ready
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                Enter your email to unlock your personalized diagnosis and the premium Blueprint PDF — a practical, printable plan with severity insights, entry-point priorities, safety steps, decision filters, and a 30-day elimination action map.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-5 text-left">
                {["Severity score + species ID", "Tonight's containment checklist", "CDC-aligned cleanup steps", "30-day prevention planner"].map((item) => (
                  <div key={item} className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground flex items-start gap-2">
                    <FileText className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

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
                  {loading ? "Sending Blueprint..." : "Unlock Report + Free Blueprint PDF"}
                </Button>
              </form>

              <div className="flex items-center justify-center gap-4 mt-5 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  No spam
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  PDF after capture
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
