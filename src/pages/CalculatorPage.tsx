import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CalculatorPage() {
  const [initialMice, setInitialMice] = useState(2);

  const projections = useMemo(() => {
    // House mouse: ~6 litters/year, ~6 pups, breeding at 6 weeks
    // Simplified: monthly growth factor ~1.4x for a small colony
    const months = [0, 1, 3, 6, 9, 12];
    return months.map((m) => {
      if (m === 0) return { month: m, count: initialMice };
      const count = Math.round(initialMice * Math.pow(1.45, m));
      return { month: m, count: Math.min(count, 5000) };
    });
  }, [initialMice]);

  const maxCount = projections[projections.length - 1].count;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-10 md:py-16 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <span className="text-4xl mb-3 block">🧮</span>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Infestation Growth Calculator
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              How fast can mice multiply? Drag the slider and see the alarming reality.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
            <label className="text-sm font-medium text-foreground mb-4 block">
              "I think I have about <span className="text-accent font-bold text-lg">{initialMice}</span> mice"
            </label>
            <Slider
              value={[initialMice]}
              onValueChange={([v]) => setInitialMice(v)}
              min={1}
              max={20}
              step={1}
              className="mb-8"
            />

            <div className="space-y-3">
              {projections.map((p, i) => {
                const barWidth = maxCount > 0 ? (p.count / maxCount) * 100 : 0;
                const isScary = p.count > 50;
                return (
                  <div key={p.month} className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-20 shrink-0 text-right">
                      {p.month === 0 ? "Now" : `${p.month} month${p.month > 1 ? "s" : ""}`}
                    </span>
                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                      <motion.div
                        className={`h-full rounded-lg ${
                          isScary ? "bg-destructive" : p.count > 20 ? "bg-warning" : "bg-success"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(barWidth, 2)}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                      />
                      <span className={`absolute inset-0 flex items-center px-3 text-xs font-bold ${
                        barWidth > 30 ? "text-primary-foreground" : "text-foreground"
                      }`}>
                        {p.count.toLocaleString()} mice
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center">
            <p className="text-foreground font-medium mb-1">
              {initialMice} mice → <span className="text-destructive font-bold">{maxCount.toLocaleString()} mice</span> in 12 months
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Don't wait. Find out exactly what to do — take our free diagnostic quiz.
            </p>
            <Link to="/quiz">
              <Button variant="hero" size="lg">
                Get Your Free Diagnosis <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
