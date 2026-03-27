import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { quizSteps, QuizAnswers } from "@/lib/quiz-data";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function QuizPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [zipValue, setZipValue] = useState("");
  const current = quizSteps[step];
  const progress = ((step + 1) / quizSteps.length) * 100;

  const handleSelect = (optionId: string) => {
    if (current.type === "single") {
      setAnswers((prev) => ({ ...prev, [current.id]: optionId }));
      // Auto-advance after brief delay
      setTimeout(() => {
        if (step < quizSteps.length - 1) setStep(step + 1);
      }, 300);
    } else if (current.type === "multi") {
      setAnswers((prev) => {
        const existing = (prev[current.id] as string[]) || [];
        if (optionId === "nothing" || optionId === "none") {
          return { ...prev, [current.id]: [optionId] };
        }
        const filtered = existing.filter((id) => id !== "nothing" && id !== "none");
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
    if (step < quizSteps.length - 1) {
      setStep(step + 1);
    } else {
      // Submit
      const finalAnswers = { ...answers };
      if (current.type === "zip") finalAnswers.zip = zipValue;
      navigate("/report", { state: { answers: finalAnswers } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex flex-col">
        {/* Progress bar */}
        <div className="w-full bg-muted h-1.5">
          <motion.div
            className="h-full bg-accent-gradient rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="flex-1 container mx-auto px-4 py-8 md:py-16 max-w-2xl">
          {/* Step counter */}
          <div className="text-sm text-muted-foreground mb-2">
            Step {step + 1} of {quizSteps.length} · {current.category}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                {current.question}
              </h2>
              {current.subtitle && (
                <p className="text-muted-foreground mb-8">{current.subtitle}</p>
              )}

              {/* Options */}
              {current.type !== "zip" && current.options && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {current.options.map((opt) => {
                    const selected = isSelected(opt.id);
                    return (
                      <motion.button
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        whileTap={{ scale: 0.97 }}
                        className={`relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all ${
                          selected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                        }`}
                      >
                        {selected && (
                          <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                        )}
                        <span className="text-2xl mb-2">{opt.icon}</span>
                        <span className="text-sm font-medium text-foreground">{opt.label}</span>
                        {opt.description && (
                          <span className="text-xs text-muted-foreground mt-1">{opt.description}</span>
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
                    className="text-2xl text-center h-16 font-mono tracking-widest"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-10">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            {(current.type === "multi" || current.type === "zip") && (
              <Button
                variant="hero"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {step === quizSteps.length - 1 ? "Get My Free Report" : "Next"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
