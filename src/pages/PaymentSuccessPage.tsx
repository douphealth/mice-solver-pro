import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2, RefreshCw, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { savePaidReport, saveQuizAnswers } from "@/lib/report-session";
import { trackEvent } from "@/lib/analytics";
import type { QuizAnswers } from "@/lib/quiz-data";

interface VerificationResult {
  verified: boolean;
  paid: boolean;
  sessionId: string;
  answers: QuizAnswers;
  amountTotal: number;
  currency: string;
  livemode: boolean;
}

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"verifying" | "verified" | "error">("verifying");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId || !sessionId.startsWith("cs_")) {
      setStatus("error");
      setMessage("The Stripe Checkout session is missing or invalid.");
      return;
    }

    const controller = new AbortController();
    fetch(`/api/verify-checkout?session_id=${encodeURIComponent(sessionId)}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || !body?.verified || !body?.paid || !body?.answers) {
          throw new Error(body?.error || "We could not verify the payment.");
        }
        return body as VerificationResult;
      })
      .then((body) => {
        saveQuizAnswers(body.answers);
        savePaidReport({
          sessionId: body.sessionId,
          answers: body.answers,
          verifiedAt: new Date().toISOString(),
          amountTotal: body.amountTotal,
          currency: body.currency,
        });
        setResult(body);
        setStatus("verified");
        trackEvent("payment_verified", {
          amount: body.amountTotal,
          currency: body.currency,
          livemode: body.livemode,
        });
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setStatus("error");
        setMessage(error?.message || "We could not verify the payment.");
        trackEvent("payment_verification_failed");
      });

    return () => controller.abort();
  }, [sessionId]);

  const priceLabel = useMemo(() => {
    if (!result) return "";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: result.currency.toUpperCase(),
      }).format(result.amountTotal / 100);
    } catch {
      return `${(result.amountTotal / 100).toFixed(2)} ${result.currency.toUpperCase()}`;
    }
  }, [result]);

  const openReport = () => {
    if (!result) return;
    navigate(`/report?purchase=${encodeURIComponent(result.sessionId)}`, {
      state: { answers: result.answers, isPro: true, purchaseSessionId: result.sessionId },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          className="glass-card-elevated rounded-2xl p-10 text-center max-w-lg w-full"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {status === "verifying" && (
            <>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-3">Verifying Your Payment</h1>
              <p className="text-muted-foreground leading-relaxed">
                We are confirming the Checkout Session directly with Stripe before unlocking paid content.
              </p>
            </>
          )}

          {status === "verified" && result && (
            <>
              <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent mb-3">
                <ShieldCheck className="h-4 w-4" /> Stripe payment verified
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-3">Pro Masterplan Unlocked</h1>
              <p className="text-muted-foreground mb-3 leading-relaxed">
                Your one-time payment{priceLabel ? ` of ${priceLabel}` : ""} is verified. Your complete personalized plan and Pro PDF are ready.
              </p>
              <p className="text-xs text-muted-foreground mb-8">
                Access is cached in this browser and can be re-verified against Stripe from this Checkout Session.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="premium" size="lg" className="gap-2" onClick={openReport}>
                  View Full Pro Report <ArrowRight className="h-4 w-4" />
                </Button>
                <Link to="/"><Button variant="outline" size="lg" className="w-full sm:w-auto">Back to Home</Button></Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-3">Payment Verification Needed</h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">{message}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="default" size="lg" className="gap-2" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4" /> Check Again
                </Button>
                <Link to="/report"><Button variant="outline" size="lg" className="w-full sm:w-auto">Return to Report</Button></Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
