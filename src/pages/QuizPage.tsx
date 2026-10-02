import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quizSteps, type QuizAnswers } from "@/lib/quiz-data";
import { trackEvent } from "@/lib/analytics";
import { PLANNER_LIMITATION } from "@/lib/report-generator";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function QuizPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const current = quizSteps[stepIndex];
  const value = answers[current.id];
  const valid = current.type === "single" ? typeof value === "string" && current.options.some(x => x.id === value) : Array.isArray(value) && value.length > 0;
  useEffect(() => { trackEvent("planner_start"); }, []);
  function select(id: string) {
    if (!current.options.some(x => x.id === id)) return;
    setAnswers(previous => {
      if (current.type === "single") return { ...previous, [current.id]: id };
      const old = Array.isArray(previous[current.id]) ? previous[current.id] as string[] : [];
      if (["none", "nothing"].includes(id)) return { ...previous, [current.id]: [id] };
      const choices = old.filter(x => !["none", "nothing"].includes(x));
      return { ...previous, [current.id]: choices.includes(id) ? choices.filter(x => x !== id) : [...choices, id] };
    });
  }
  function next() {
    if (!valid) return;
    if (stepIndex + 1 < quizSteps.length) { setStepIndex(stepIndex + 1); return; }
    trackEvent("planner_complete", { steps: quizSteps.length });
    navigate("/report", { state: { answers } });
  }
  return <div className="min-h-screen bg-background"><Navbar/><main className="container mx-auto px-4 py-10 max-w-2xl">
    <h1 className="text-2xl font-display font-bold mb-3">Personalized Mouse Control Planner</h1>
    <p className="text-sm text-muted-foreground mb-6">{PLANNER_LIMITATION}</p>
    <p className="text-sm mb-4" aria-live="polite">Step {stepIndex + 1} of {quizSteps.length}: {current.category}</p>
    <fieldset className="border-0 p-0 min-w-0"><legend className="text-xl font-semibold mb-3">{current.question}</legend>
      {current.subtitle && <p className="text-sm text-muted-foreground mb-5">{current.subtitle}</p>}
      <div className="grid gap-3 sm:grid-cols-2">{current.options.map(option => <label key={option.id} className="flex gap-3 items-start border border-border rounded-xl p-4 cursor-pointer focus-within:ring-2 focus-within:ring-primary">
        <input className="mt-1" type={current.type === "multi" ? "checkbox" : "radio"} name={current.id} value={option.id} checked={Array.isArray(value) ? value.includes(option.id) : value === option.id} onChange={() => select(option.id)}/>
        <span><span className="block font-medium">{option.label}</span>{option.description && <span className="block text-sm text-muted-foreground mt-1">{option.description}</span>}</span>
      </label>)}</div>
    </fieldset>
    <div className="flex justify-between gap-4 mt-8"><Button variant="outline" onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>Back</Button><Button variant="hero" onClick={next} disabled={!valid}>{stepIndex === quizSteps.length - 1 ? "View my plan" : "Next"}</Button></div>
    <p className="text-xs text-muted-foreground mt-6">No name, email, address or health details are needed to view this plan. Download a copy before leaving the report page.</p>
  </main></div>;
}
