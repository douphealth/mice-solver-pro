import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, Zap, BarChart3, Target, Calculator, MapPin, ArrowRight, CheckCircle2, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(152_45%_30%/0.4),transparent_60%)]" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-1.5 text-sm text-primary-foreground/80 mb-6"
            >
              <Zap className="h-4 w-4" />
              AI-Powered Mouse Diagnosis — 100% Free
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-tight mb-6"
            >
              Got Mice?{" "}
              <span className="text-gradient-hero">Get Your Free</span>{" "}
              Elimination Plan
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              A pest control consultation costs $150–$500+. Our AI diagnostic gives you a professional-grade, personalized mouse removal plan in under 3 minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/quiz">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  🐭 Start Free Diagnosis
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
              <Link to="/tools/calculator">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  Try Infestation Calculator
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 flex items-center justify-center gap-6 text-sm text-primary-foreground/50"
            >
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> No signup required</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> 2-minute quiz</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Instant results</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What You Get (Free) */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Your Free Mouse Problem Report Includes
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything a pest control expert would assess on a first visit — powered by AI, delivered instantly.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Target, title: "Rodent Identification", desc: "Species identified with behavioral profile, diet, and reproduction rate" },
              { icon: BarChart3, title: "Severity Score (1-10)", desc: "Visual gauge with plain-language explanation of your infestation level" },
              { icon: Shield, title: "Health Risk Assessment", desc: "Specific risks based on your rodent species, home, and household" },
              { icon: MapPin, title: "Entry Point Analysis", desc: "Most probable entry points based on your home type and age" },
              { icon: Calculator, title: "Population Projection", desc: "Estimated current count and 30-day growth if untreated" },
              { icon: Zap, title: "3 Immediate Actions", desc: "Specific, actionable steps you can do TONIGHT to start fighting back" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="text-center mt-12">
            <Link to="/quiz">
              <Button variant="hero" size="xl">
                Get Your Free Report Now →
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Free Tools */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Free Tools — No Quiz Required
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Standalone tools to help you understand and combat your mouse problem.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <motion.div {...fadeUp}>
              <Link to="/tools/calculator" className="block glass-card rounded-xl p-8 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-4xl mb-4">🧮</div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">Infestation Growth Calculator</h3>
                <p className="text-muted-foreground text-sm mb-4">See how fast mice multiply. Enter your estimate and watch the population explode over 12 months.</p>
                <span className="text-primary font-medium text-sm flex items-center gap-1">
                  Try it free <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>

            <motion.div {...fadeUp}>
              <Link to="/tools/entry-points" className="block glass-card rounded-xl p-8 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">Entry Point Finder</h3>
                <p className="text-muted-foreground text-sm mb-4">Select your home type to find every common mouse entry point with sealing instructions.</p>
                <span className="text-primary font-medium text-sm flex items-center gap-1">
                  Find entry points <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social proof / value prop */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-accent text-accent" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl font-display text-foreground italic mb-6 leading-relaxed">
              "I was quoted $350 for a pest control visit. This app told me exactly what I was dealing with and what to do. The three action steps alone solved my problem in a week."
            </blockquote>
            <p className="text-muted-foreground font-medium">— Sarah M., Portland, OR</p>
          </motion.div>
        </div>
      </section>

      {/* Premium Teaser */}
      <section className="py-20 bg-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(38_85%_55%/0.1),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/20 rounded-full px-4 py-1.5 text-sm text-accent mb-6">
              💎 Premium Upgrade
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Complete Elimination Masterplan — $7.99
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto leading-relaxed">
              What pest control companies charge $200–$500 for. Room-by-room strategy, shopping list with exact products, 12-month prevention calendar, and downloadable PDF.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left mb-10">
              {[
                "Day-by-day elimination protocol",
                "Custom entry point sealing blueprint",
                "Personalized shopping list",
                "Health decontamination guide",
                "12-month prevention calendar",
                "Progress tracker & troubleshooting",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-primary-foreground/80 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Link to="/quiz">
              <Button variant="premium" size="xl">
                Start with Free Diagnosis First →
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
