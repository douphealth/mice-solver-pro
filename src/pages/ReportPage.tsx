import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { generateReport } from "@/lib/report-generator";
import { QuizAnswers } from "@/lib/quiz-data";
import SeverityGauge from "@/components/SeverityGauge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Shield, AlertTriangle, MapPin, Zap, TrendingUp, Bug,
  CheckCircle2, Lock, ShoppingCart, Calendar, ClipboardList,
  Sparkles, FileText
} from "lucide-react";

const mouseFacts = [
  "Mice can squeeze through a gap the width of a pencil (¼ inch).",
  "A single pair of mice can produce up to 12,000 descendants in a year.",
  "Mice can jump 12 inches high and survive falls from 8 feet.",
  "A mouse needs only 3 grams of food per day to survive.",
  "Mice are colorblind but have excellent hearing and smell.",
];

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
    const factTimer = setInterval(() => setFactIndex((i) => (i + 1) % mouseFacts.length), 2000);
    const loadTimer = setTimeout(() => setLoading(false), 3000);
    return () => { clearInterval(factTimer); clearTimeout(loadTimer); };
  }, [answers, navigate]);

  const report = useMemo(() => {
    if (!answers) return null;
    return generateReport(answers);
  }, [answers]);

  if (!answers || !report) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-hero flex flex-col items-center justify-center px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-8"
        >
          <Bug className="h-16 w-16 text-accent" />
        </motion.div>
        <h2 className="text-2xl font-display font-bold text-primary-foreground mb-4">
          Analyzing Your Situation...
        </h2>
        <div className="w-64 bg-primary-foreground/10 rounded-full h-2 mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-accent-gradient rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
        <motion.p
          key={factIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-primary-foreground/60 text-sm text-center max-w-md"
        >
          🐭 Did you know? {mouseFacts[factIndex]}
        </motion.p>
      </div>
    );
  }

  const sectionClass = "glass-card rounded-2xl p-6 md:p-8";
  const sectionTitle = "text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-3";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 text-center">
            Your Mouse Problem Report
          </h1>
          <p className="text-muted-foreground text-center mb-10">
            AI-powered analysis based on your diagnostic answers
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Severity */}
          <motion.section className={sectionClass} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className={sectionTitle}>
              <TrendingUp className="h-6 w-6 text-primary" />
              Infestation Severity
            </h2>
            <SeverityGauge score={report.severity} label={report.severityLabel} />
            <p className="text-muted-foreground mt-4 leading-relaxed text-center">{report.severityDescription}</p>
          </motion.section>

          {/* Species */}
          <motion.section className={sectionClass} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className={sectionTitle}>
              <Bug className="h-6 w-6 text-primary" />
              Rodent Identification
            </h2>
            <div className="bg-secondary rounded-xl p-5 mb-4">
              <h3 className="text-lg font-display font-bold text-foreground">{report.species.name}</h3>
              <p className="text-xs text-muted-foreground italic mb-2">{report.species.scientificName}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{report.species.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-foreground">Behavior:</span>
                <p className="text-muted-foreground mt-1">{report.species.behavior}</p>
              </div>
              <div>
                <span className="font-semibold text-foreground">Reproduction:</span>
                <p className="text-muted-foreground mt-1">{report.species.reproductionRate}</p>
              </div>
            </div>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-foreground">
                Estimated population: <span className="text-accent font-bold">{report.estimatedPopulation.min}–{report.estimatedPopulation.max} mice</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Without action, this could grow to {report.populationIn30Days.min}–{report.populationIn30Days.max} within 30 days.
              </p>
            </div>
          </motion.section>

          {/* Health Risks */}
          <motion.section className={sectionClass} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className={sectionTitle}>
              <Shield className="h-6 w-6 text-primary" />
              Health Risk Assessment
            </h2>
            <div className="space-y-3">
              {report.healthRisks.map((risk, i) => (
                <div key={i} className={`rounded-lg p-3 text-sm ${
                  risk.startsWith("⚠️") || risk.startsWith("🔴")
                    ? "bg-destructive/10 border border-destructive/20 text-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {risk}
                </div>
              ))}
            </div>
          </motion.section>

          {/* Entry Points */}
          <motion.section className={sectionClass} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className={sectionTitle}>
              <MapPin className="h-6 w-6 text-primary" />
              Probable Entry Points
            </h2>
            <ul className="space-y-2">
              {report.entryPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* 3 Immediate Actions */}
          <motion.section
            className="border-2 border-primary bg-primary/5 rounded-2xl p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className={sectionTitle}>
              <Zap className="h-6 w-6 text-accent" />
              3 Things To Do TONIGHT
            </h2>
            <div className="space-y-4">
              {report.immediateActions.map((action, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent-gradient text-accent-foreground flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed pt-1">{action}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Premium Content - Blurred Preview */}
          <motion.section
            className="relative rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* Blurred background content */}
            <div className="glass-card rounded-2xl p-6 md:p-8 pointer-events-none select-none filter blur-[6px]">
              <h2 className={sectionTitle}>
                <ClipboardList className="h-6 w-6 text-primary" />
                Room-by-Room Elimination Strategy
              </h2>
              <div className="space-y-3">
                {report.roomByRoomStrategy.map((s, i) => (
                  <div key={i} className="bg-secondary rounded-lg p-3 text-sm text-muted-foreground">{s}</div>
                ))}
              </div>

              <h2 className={`${sectionTitle} mt-8`}>
                <ShoppingCart className="h-6 w-6 text-primary" />
                Your Personalized Shopping List
              </h2>
              <div className="space-y-2">
                {report.shoppingList.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-secondary rounded-lg p-3">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className={`${sectionTitle} mt-8`}>
                <Calendar className="h-6 w-6 text-primary" />
                30-Day Elimination Timeline
              </h2>
              <div className="space-y-2">
                {report.eliminationTimeline.slice(0, 3).map((t, i) => (
                  <div key={i} className="bg-secondary rounded-lg p-3">
                    <p className="text-sm font-semibold text-foreground">{t.day}</p>
                    <p className="text-xs text-muted-foreground">{t.action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Overlay CTA */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <div className="text-center px-6 max-w-md">
                <div className="inline-flex items-center gap-2 bg-accent/20 rounded-full px-4 py-1.5 text-sm text-accent mb-4">
                  <Sparkles className="h-4 w-4" />
                  Pro Report
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
                  Unlock Your Complete Elimination Masterplan
                </h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  Get the step-by-step plan to eliminate mice — customized to YOUR exact situation.
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto text-left mb-6">
                  {[
                    "Room-by-room strategy",
                    "Exact product shopping list",
                    "Day-by-day protocol",
                    "Prevention calendar",
                    "Decontamination guide",
                    "Downloadable PDF",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-xs text-foreground">
                      <CheckCircle2 className="h-3 w-3 text-accent shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <Button variant="premium" size="xl">
                  <Lock className="h-5 w-5 mr-1" />
                  Unlock Full Plan — $9.99
                </Button>
                <p className="text-muted-foreground text-xs mt-3">One-time payment · Instant access · 100% personalized</p>
              </div>
            </div>
          </motion.section>

          {/* Retake */}
          <div className="text-center pt-4 pb-8">
            <Link to="/quiz">
              <Button variant="outline">Retake the Quiz</Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
