import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { generateReport } from "@/lib/report-generator";
import { trackEvent } from "@/lib/analytics";
import { generatePDF } from "@/lib/pdf-generator";
import type { QuizAnswers } from "@/lib/quiz-data";
import {
  loadCapturedEmail,
  loadPaidReport,
  loadQuizAnswers,
  saveCapturedEmail,
  saveQuizAnswers,
} from "@/lib/report-session";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Share2, CheckCircle2, FileText, Shield, XCircle } from "lucide-react";
import ReportLoading from "@/components/report/ReportLoading";
import ReportSeveritySection from "@/components/report/ReportSeveritySection";
import ReportSpeciesSection from "@/components/report/ReportSpeciesSection";
import ReportHealthSection from "@/components/report/ReportHealthSection";
import ReportEntryPointsSection from "@/components/report/ReportEntryPointsSection";
import ReportActionsSection from "@/components/report/ReportActionsSection";
import ReportPremiumPreview from "@/components/report/ReportPremiumPreview";
import EmailCaptureModal from "@/components/EmailCaptureModal";

interface ReportLocationState {
  answers?: QuizAnswers;
  isPro?: boolean;
  purchaseSessionId?: string;
}

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as ReportLocationState | null) || null;
  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const purchaseSessionId = state?.purchaseSessionId || search.get("purchase");
  const paidCache = useMemo(
    () => (purchaseSessionId ? loadPaidReport(purchaseSessionId) : null),
    [purchaseSessionId]
  );
  const cachedQuizAnswers = useMemo(() => loadQuizAnswers(), []);
  const answers = state?.answers || paidCache?.answers || cachedQuizAnswers;
  const isPro = Boolean(state?.isPro || paidCache);
  const checkoutCancelled = search.get("checkout") === "cancelled";

  const [loading, setLoading] = useState(true);
  const [factIndex, setFactIndex] = useState(0);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState(() => loadCapturedEmail());
  const [emailCaptured, setEmailCaptured] = useState(() => Boolean(loadCapturedEmail()));

  useEffect(() => {
    if (!answers) {
      navigate("/quiz", { replace: true });
      return;
    }

    saveQuizAnswers(answers);
    trackEvent("report_viewed", { pro: isPro });

    const factTimer = window.setInterval(() => setFactIndex((i) => (i + 1) % 8), 2000);
    const loadTimer = window.setTimeout(() => {
      setLoading(false);
      if (!isPro && !loadCapturedEmail()) {
        setShowEmailGate(true);
      }
    }, 900);

    return () => {
      window.clearInterval(factTimer);
      window.clearTimeout(loadTimer);
    };
  }, [answers, isPro, navigate]);

  const report = useMemo(() => {
    if (!answers) return null;
    return generateReport(answers);
  }, [answers]);

  const handleEmailSuccess = (email: string) => {
    saveCapturedEmail(email);
    setCapturedEmail(email);
    setShowEmailGate(false);
    setEmailCaptured(true);
    trackEvent("email_captured");
  };

  if (!answers || !report) return null;
  if (loading) return <ReportLoading factIndex={factIndex} />;
  if (showEmailGate && !emailCaptured && !isPro) {
    return (
      <EmailCaptureModal
        open={true}
        onSuccess={handleEmailSuccess}
        severity={report.severity}
        species={report.species.name}
      />
    );
  }

  const handleDownloadPDF = () => {
    trackEvent("pdf_downloaded", {
      severity: report.severity,
      species: report.species.name,
      pro: isPro,
    });
    const doc = generatePDF(report, isPro);
    doc.save(isPro ? "MiceGoneGuide-Pro-Elimination-Masterplan.pdf" : "MiceGoneGuide-Free-Diagnostic-Summary.pdf");
  };

  const handleShare = async () => {
    const shareUrl = "https://elimination.micegoneguide.com/quiz";
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Mouse Problem Report — MiceGoneGuide",
          text: "Get your free MiceGoneGuide mouse infestation diagnostic:",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // Sharing is optional and must never interrupt the report.
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="bg-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(152_45%_30%/0.3),transparent_50%)]" />
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="trust-badge bg-primary-foreground/10 text-primary-foreground/70">
                <Shield className="h-3 w-3" />
                Diagnostic analysis
              </span>
              <span className="trust-badge bg-primary-foreground/10 text-primary-foreground/70">
                <CheckCircle2 className="h-3 w-3" />
                {isPro ? "Pro access verified" : "Analysis complete"}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-3 leading-tight">
              {isPro ? "Your Pro Mouse Elimination Masterplan" : "Your Mouse Problem Report"}
            </h1>
            <p className="text-primary-foreground/60 text-sm mb-8 max-w-md mx-auto">
              Personalized guidance based on your {Object.keys(answers).length} diagnostic answers
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="hero" size="lg" onClick={handleDownloadPDF} className="gap-2 shadow-xl">
                <Download className="h-4 w-4" />
                {isPro ? "Download Pro Masterplan PDF" : "Download Free Summary PDF"}
              </Button>
              <Button variant="hero-outline" size="lg" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share Quiz
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {checkoutCancelled && (
          <div className="mb-6 rounded-xl border border-border bg-muted/40 px-4 py-3 flex gap-3 items-start text-sm text-muted-foreground">
            <XCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-semibold text-foreground">Checkout cancelled</p>
              <p>No payment was recorded. Your free report is still available below.</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <ReportSeveritySection report={report} />
          <ReportSpeciesSection report={report} />
          <ReportHealthSection report={report} />
          <ReportEntryPointsSection report={report} />
          <ReportActionsSection report={report} />

          <motion.div
            className="glass-card-elevated rounded-2xl p-8 text-center overflow-hidden relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="h-1 bg-accent-gradient absolute top-0 left-0 right-0" />
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground mb-2">
              {isPro ? "Keep Your Pro Plan Offline" : "Save Your Free Diagnostic Summary"}
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
              {isPro
                ? "Download the complete Pro masterplan, including the paid room-by-room strategy, timeline, cleanup protocol, prevention calendar, and worksheets."
                : "Download the free diagnostic summary with your severity, likely species, entry-point priorities, immediate actions, and safety guidance."}
            </p>
            <Button variant="default" size="lg" onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" />
              {isPro ? "Download Pro PDF" : "Download Free Summary PDF"}
            </Button>
          </motion.div>

          <ReportPremiumPreview
            report={report}
            answers={answers}
            capturedEmail={capturedEmail}
            isPro={isPro}
            onDownloadPro={handleDownloadPDF}
          />

          <div className="text-center pt-4 pb-8">
            <Link to="/quiz">
              <Button variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Retake the Quiz
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
