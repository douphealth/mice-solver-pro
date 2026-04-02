import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { generateReport } from "@/lib/report-generator";
import { generatePDF } from "@/lib/pdf-generator";
import { QuizAnswers } from "@/lib/quiz-data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Share2, CheckCircle2, FileText, Shield, Sparkles } from "lucide-react";
import ReportLoading from "@/components/report/ReportLoading";
import ReportSeveritySection from "@/components/report/ReportSeveritySection";
import ReportSpeciesSection from "@/components/report/ReportSpeciesSection";
import ReportHealthSection from "@/components/report/ReportHealthSection";
import ReportEntryPointsSection from "@/components/report/ReportEntryPointsSection";
import ReportActionsSection from "@/components/report/ReportActionsSection";
import ReportPremiumPreview from "@/components/report/ReportPremiumPreview";

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [factIndex, setFactIndex] = useState(0);

  const answers = (location.state as { answers: QuizAnswers } | null)?.answers;

  useEffect(() => {
    if (!answers) {
      navigate("/quiz");
      return;
    }
    const factTimer = setInterval(() => setFactIndex((i) => (i + 1) % 8), 2000);
    const loadTimer = setTimeout(() => setLoading(false), 3000);
    return () => { clearInterval(factTimer); clearTimeout(loadTimer); };
  }, [answers, navigate]);

  const report = useMemo(() => {
    if (!answers) return null;
    return generateReport(answers);
  }, [answers]);

  if (!answers || !report) return null;
  if (loading) return <ReportLoading factIndex={factIndex} />;

  const handleDownloadPDF = () => {
    const doc = generatePDF(report, false);
    doc.save("MiceGoneGuide-Report.pdf");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "My Mouse Problem Report — MiceGoneGuide",
        text: `I scored ${report.severity}/10 on the MiceGoneGuide mouse infestation diagnostic. Get your free report:`,
        url: "https://app.micegoneguide.com/quiz",
      });
    } else {
      await navigator.clipboard.writeText("https://app.micegoneguide.com/quiz");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Report Header */}
      <div className="bg-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(152_45%_30%/0.3),transparent_50%)]" />
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="trust-badge bg-primary-foreground/10 text-primary-foreground/70">
                <Shield className="h-3 w-3" />
                AI-Powered
              </span>
              <span className="trust-badge bg-primary-foreground/10 text-primary-foreground/70">
                <CheckCircle2 className="h-3 w-3" />
                Analysis Complete
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-3 leading-tight">
              Your Mouse Problem Report
            </h1>
            <p className="text-primary-foreground/50 text-sm mb-8 max-w-md mx-auto">
              Professional-grade analysis based on your {Object.keys(answers).length} diagnostic answers
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="hero"
                size="lg"
                onClick={handleDownloadPDF}
                className="gap-2 shadow-xl"
              >
                <Download className="h-4 w-4" />
                Download Free PDF Report
              </Button>
              <Button
                variant="hero-outline"
                size="lg"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share Report
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="space-y-6">
          <ReportSeveritySection report={report} />
          <ReportSpeciesSection report={report} />
          <ReportHealthSection report={report} />
          <ReportEntryPointsSection report={report} />
          <ReportActionsSection report={report} />

          {/* Download CTA between free and premium */}
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
              Save Your Free Report
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
              Download a professionally formatted PDF with your full severity analysis, species ID, and action plan.
            </p>
            <Button variant="default" size="lg" onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF Report (Free)
            </Button>
          </motion.div>

          <ReportPremiumPreview report={report} />

          {/* Retake */}
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
