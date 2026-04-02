import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { quizSteps, QuizAnswers } from "@/lib/quiz-data";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function QuizPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [zipValue, setZipValue] = useState("");

  const activeSteps = useMemo(() => {
    return quizSteps.filter((s) => !s.showIf || s.showIf(answers));
  }, [answers]);

  const [stepIndex, setStepIndex] = useState(0);
  const current = activeSteps[Math.min(stepIndex, activeSteps.length - 1)];
  const progress = ((stepIndex + 1) / activeSteps.length) * 100;

  const handleSelect = (optionId: string) => {
    if (current.type === "single") {
      setAnswers((prev) => ({ ...prev, [current.id]: optionId }));
      setTimeout(() => {
        if (stepIndex < activeSteps.length - 1) setStepIndex(stepIndex + 1);
      }, 300);
    } else if (current.type === "multi") {
      setAnswers((prev) => {
        const existing = (prev[current.id] as string[]) || [];
        if (optionId === "nothing" || optionId === "none" || optionId === "none_attractants") {
          return { ...prev, [current.id]: [optionId] };
        }
        const filtered = existing.filter((id) => id !== "nothing" && id !== "none" && id !== "none_attractants");
        if (filtered.includes(optionId)) {
          return { ...prev, [current.id]: filtered.filter((id) => id !== optionId) };
        }
        return { ...prev, [current.id]: [...filtered, optionId] };
      });
    }
  };

  const isSelected = (optionId: string) => {
    const val = answers[current.id];
    if (Array.isArray(val)) return val.includes(optionId);
    return val === optionId;
  };

  const canProceed = () => {
    if (current.type === "zip") return zipValue.length === 5;
    const val = answers[current.id];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  };

  const handleNext = () => {
    if (current.type === "zip") {
      setAnswers((prev) => ({ ...prev, zip: zipValue }));
    }
    if (stepIndex < activeSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      const finalAnswers = { ...answers };
      if (current.type === "zip") finalAnswers.zip = zipValue;
      trackEvent("quiz_completed", { steps: activeSteps.length });
      navigate("/report", { state: { answers: finalAnswers } });
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const estimatedTimeLeft = Math.max(1, Math.ceil((activeSteps.length - stepIndex) * 0.25));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex flex-col">
        {/* Progress bar */}
        <div className="w-full bg-muted h-1.5 relative">
          <motion.div
            className="h-full bg-accent-gradient rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="flex-1 container mx-auto px-4 py-8 md:py-16 max-w-2xl">
          {/* Step counter */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="section-badge bg-primary/10 text-primary">
                {current.category}
              </div>
              <span className="text-xs text-muted-foreground">
                {stepIndex + 1} of {activeSteps.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              ~{estimatedTimeLeft} min left
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2 leading-tight">
                {current.question}
              </h2>
              {current.subtitle && (
                <p className="text-muted-foreground mb-8 text-sm">{current.subtitle}</p>
              )}

              {/* Options */}
              {current.type !== "zip" && current.options && (
                <div className={`grid gap-3 ${
                  current.options.length <= 4 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
                }`}>
                  {current.options.map((opt) => {
                    const selected = isSelected(opt.id);
                    return (
                      <motion.button
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        whileTap={{ scale: 0.97 }}
                        className={`relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all duration-200 ${
                          selected
                            ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                            : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                        }`}
                      >
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2"
                          >
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </motion.div>
                        )}
                        <span className="text-2xl mb-2">{opt.icon}</span>
                        <span className="text-sm font-medium text-foreground">{opt.label}</span>
                        {opt.description && (
                          <span className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.description}</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* ZIP input */}
              {current.type === "zip" && (
                <div className="max-w-xs">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 97201"
                    maxLength={5}
                    value={zipValue}
                    onChange={(e) => setZipValue(e.target.value.replace(/\D/g, ""))}
                    className="text-2xl text-center h-16 font-mono tracking-widest border-2"
                  />
                  <p className="text-xs text-muted-foreground mt-3 text-center flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    Optional — helps with seasonal and regional insights
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-10">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={stepIndex === 0}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            {(current.type === "multi" || current.type === "zip") && (
              <Button
                variant="hero"
                onClick={handleNext}
                disabled={current.type === "zip" ? false : !canProceed()}
                className="gap-1"
              >
                {stepIndex === activeSteps.length - 1 ? "Get My Free Report" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
