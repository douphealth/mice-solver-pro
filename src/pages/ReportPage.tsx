import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { generateReport } from "@/lib/report-generator";
import { generatePDF } from "@/lib/pdf-generator";
import { QuizAnswers } from "@/lib/quiz-data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Share2, CheckCircle2 } from "lucide-react";
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
      <div className="bg-hero py-10 md:py-14">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-1.5 text-sm text-primary-foreground/80 mb-4">
              <CheckCircle2 className="h-4 w-4" />
              Analysis Complete
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-2">
              Your Mouse Problem Report
            </h1>
            <p className="text-primary-foreground/60 text-sm mb-6">
              AI-powered analysis based on your {Object.keys(answers).length} diagnostic answers
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="hero"
                size="lg"
                onClick={handleDownloadPDF}
                className="gap-2"
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
                Share
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
            className="bg-secondary rounded-2xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <p className="text-sm font-medium text-foreground mb-3">
              📄 Save your free report as a professional PDF
            </p>
            <Button variant="default" onClick={handleDownloadPDF} className="gap-2">
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
