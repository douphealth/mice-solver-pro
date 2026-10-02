import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Lock, RotateCcw } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Callout, ScopeNote } from "@/components/ui-kit";
import { OptionIcon } from "@/components/OptionIcon";
import { quizSteps, type QuizAnswers } from "@/lib/quiz-data";
import { clearAnswers, loadAnswers, saveAnswers } from "@/lib/answers";
import { trackEvent } from "@/lib/analytics";

const EXCLUSIVE = ["none", "nothing"];

export default function QuizPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<QuizAnswers>(() => loadAnswers());
  const [restored] = useState(() => Object.keys(loadAnswers()).length > 0);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const current = quizSteps[stepIndex];
  const value = answers[current.id];
  const valid = current.type === "single" ? typeof value === "string" && current.options.some(o => o.id === value) : Array.isArray(value) && value.length > 0;
  const isLast = stepIndex === quizSteps.length - 1;
  const pct = Math.round(((stepIndex + (valid ? 1 : 0)) / quizSteps.length) * 100);

  useEffect(() => { trackEvent("planner_start"); }, []);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [stepIndex]);
  useEffect(() => { saveAnswers(answers); }, [answers]);

  const hazardsChosen = useMemo(
    () => (current.type === "multi" && Array.isArray(value) ? current.options.filter(o => o.hazard && value.includes(o.id)) : []),
    [current, value],
  );

  function select(id: string) {
    if (!current.options.some(o => o.id === id)) return;
    setAnswers(prev => {
      if (current.type === "single") return { ...prev, [current.id]: id };
      const old = Array.isArray(prev[current.id]) ? (prev[current.id] as string[]) : [];
      if (EXCLUSIVE.includes(id)) return { ...prev, [current.id]: old.includes(id) ? [] : [id] };
      const kept = old.filter(x => !EXCLUSIVE.includes(x));
      return { ...prev, [current.id]: kept.includes(id) ? kept.filter(x => x !== id) : [...kept, id] };
    });
  }

  function go(delta: number) {
    setDirection(delta);
    setStepIndex(i => Math.min(quizSteps.length - 1, Math.max(0, i + delta)));
  }

  function next() {
    if (!valid) return;
    if (!isLast) { go(1); return; }
    saveAnswers(answers);
    trackEvent("planner_complete", { steps: quizSteps.length });
    navigate("/plan", { state: { answers } });
  }

  function startFresh() {
    clearAnswers();
    setAnswers({});
    setStepIndex(0);
  }

  return (
    <PageShell>
      <div className="bg-hero hero-pattern">
        <div className="container-read py-8 text-primary-foreground">
          <div className="mb-3 flex items-center justify-between text-sm">
            <p className="font-semibold tracking-wide">Step {stepIndex + 1} of {quizSteps.length} <span className="text-primary-foreground/60">· {current.category}</span></p>
            <p className="inline-flex items-center gap-1.5 text-primary-foreground/75"><Lock className="h-3.5 w-3.5" aria-hidden="true" />No signup, no email</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-primary-foreground/15" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Quiz progress">
            <motion.div className="h-full rounded-full bg-accent-gradient" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>
      </div>

      <section className="container-read py-8 md:py-10" aria-labelledby="quiz-q">
        {restored && stepIndex === 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-secondary/60 px-4 py-3 text-sm">
            <span>We kept your earlier answers on this device so you can adjust them.</span>
            <button type="button" onClick={startFresh} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />Start fresh</button>
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={current.id} initial={{ opacity: 0, x: 28 * direction }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 * direction }} transition={{ duration: 0.22 }}>
            <fieldset className="min-w-0 border-0 p-0">
              <legend className="w-full">
                <h1 id="quiz-q" ref={headingRef} tabIndex={-1} className="text-2xl font-bold leading-tight outline-none md:text-3xl">{current.question}</h1>
                {current.subtitle && <p className="mt-2 text-base leading-relaxed text-muted-foreground">{current.subtitle}</p>}
                <p className="sr-only">{current.type === "multi" ? "Choose all that apply." : "Choose one."}</p>
              </legend>

              <div className={`mt-6 grid gap-3 ${current.options.length > 4 ? "sm:grid-cols-2" : current.options.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
                {current.options.map(option => {
                  const checked = Array.isArray(value) ? value.includes(option.id) : value === option.id;
                  return (
                    <label key={option.id} className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 hover:border-primary/40 hover:shadow-sm ${checked ? "border-primary bg-primary/[0.06] shadow-sm ring-1 ring-primary" : ""} ${option.hazard ? "border-l-4 border-l-[hsl(33_90%_48%)]" : ""}`}>
                      <input className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" type={current.type === "multi" ? "checkbox" : "radio"} name={current.id} value={option.id} checked={checked} onChange={() => select(option.id)} />
                      <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${checked ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>
                        <OptionIcon name={option.icon} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold leading-snug">{option.label}</span>
                        {option.description && <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{option.description}</span>}
                      </span>
                      <span aria-hidden="true" className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors ${current.type === "multi" ? "rounded-md" : "rounded-full"} ${checked ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}>
                        {checked && <Check className="h-3 w-3" strokeWidth={3.5} />}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {hazardsChosen.length > 0 && (
              <Callout tone="safety" title="Safety first" className="mt-5">
                {hazardsChosen.map(h => h.label).join(", ")}: these aren't DIY jobs. Your plan will put qualified help at the top. Keep people and pets away from the area until then.
              </Callout>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-4">
          <Button type="button" variant="outline" size="lg" onClick={() => go(-1)} disabled={stepIndex === 0}><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back</Button>
          <Button type="button" variant="hero" size="lg" onClick={next} disabled={!valid} className="min-w-40">
            {isLast ? "View my plan" : "Next"}<ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        {!valid && <p className="mt-3 text-right text-sm text-muted-foreground" aria-live="polite">{current.type === "multi" ? "Choose at least one option to continue." : "Choose an option to continue."}</p>}

        <div className="mt-10 border-t pt-5">
          <ScopeNote />
          <p className="mt-2 text-xs text-muted-foreground">Your answers stay in this browser. Nothing is sent anywhere unless you choose email check-ins.</p>
        </div>
      </section>
    </PageShell>
  );
}
