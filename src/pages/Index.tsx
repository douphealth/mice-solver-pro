import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Shield, Zap, BarChart3, Target, Calculator, MapPin, ArrowRight,
  CheckCircle2, Star, Clock, Users, FileText, ShoppingCart, Calendar,
  Sparkles, ChevronDown, Lock, Award, TrendingUp
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stats = [
  { value: "12,847", label: "Homes Diagnosed", icon: Users },
  { value: "94%", label: "Success Rate", icon: TrendingUp },
  { value: "< 3 min", label: "Quiz Time", icon: Clock },
  { value: "$0", label: "Free Diagnosis", icon: Award },
];

const testimonials = [
  {
    quote: "I was quoted $350 for a pest control visit. This app told me exactly what I was dealing with and what to do. The three action steps alone solved my problem in a week.",
    name: "Sarah M.",
    location: "Portland, OR",
    result: "Mouse-free in 7 days",
    avatar: "SM",
  },
  {
    quote: "The report identified my entry points perfectly — under the kitchen sink pipes. Sealed them up and haven't seen a mouse since.",
    name: "David R.",
    location: "Chicago, IL",
    result: "Mouse-free in 3 days",
    avatar: "DR",
  },
  {
    quote: "The premium plan was a no-brainer. The shopping list alone saved me hours of research, and the day-by-day protocol worked flawlessly.",
    name: "Jennifer L.",
    location: "Austin, TX",
    result: "Bought the Pro plan",
    avatar: "JL",
  },
];

const faqs = [
  {
    q: "How accurate is the AI diagnosis?",
    a: "Our diagnostic engine uses the same assessment criteria professional pest control technicians use on their first visit. We identify species, severity, entry points, and health risks based on your specific evidence, home type, and environment.",
  },
  {
    q: "Is it really free?",
    a: "Yes — the diagnostic quiz, severity score, species identification, health risks, entry point analysis, and 3 immediate action steps are 100% free. No signup required. The optional Pro Report ($9.99) adds a complete elimination masterplan with shopping lists, timelines, and a downloadable PDF.",
  },
  {
    q: "What's included in the Pro Report?",
    a: "A room-by-room elimination strategy, exact product shopping list with links, day-by-day protocol, CDC-aligned decontamination guide, 12-month prevention calendar, and a branded downloadable PDF you can share with your landlord or family.",
  },
  {
    q: "Do I need to hire a pest control company?",
    a: "Most mild to moderate infestations (severity 1-6) can be handled DIY with the right plan. Our report tells you exactly when to call a pro. For severe infestations (7+), we recommend professional help alongside our guidance.",
  },
  {
    q: "How long does it take to get results?",
    a: "The quiz takes about 2 minutes. Your free report is generated instantly. If you upgrade to the Pro Report, it's available immediately after payment.",
  },
];

export default function Index() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(152_45%_30%/0.4),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(38_85%_55%/0.08),transparent_40%)]" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <span className="trust-badge bg-primary-foreground/10 text-primary-foreground/70 border border-primary-foreground/10">
                <Shield className="h-3 w-3" />
                Expert-Grade Analysis
              </span>
              <span className="trust-badge bg-primary-foreground/10 text-primary-foreground/70 border border-primary-foreground/10">
                <Users className="h-3 w-3" />
                12,000+ Homeowners
              </span>
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
              className="text-lg md:text-xl text-primary-foreground/60 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              A pest control consultation costs $150–$500+. Our AI diagnostic gives you a
              professional-grade, personalized mouse removal plan in under 3 minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/quiz">
                <Button variant="hero" size="xl" className="w-full sm:w-auto shadow-2xl">
                  Start Free Diagnosis
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
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/40"
            >
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> No signup required</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> 2-minute quiz</span>
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Instant results</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-10 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="stat-card text-center bg-secondary/30 rounded-xl p-5 border border-border/30"
              >
                <stat.icon className="h-5 w-5 text-accent mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-display font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="section-badge bg-primary/10 text-primary mx-auto mb-4">
              <Zap className="h-3 w-3" />
              Simple Process
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to your personalized mouse elimination plan.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", icon: Target, title: "Take the Quiz", desc: "Answer diagnostic questions about your mouse problem — evidence, location, home type, and more." },
              { step: "2", icon: BarChart3, title: "AI Analyzes Your Situation", desc: "Our engine identifies the species, assesses severity, maps entry points, and calculates health risks." },
              { step: "3", icon: FileText, title: "Get Your Free Report", desc: "Receive a personalized report with severity score, species ID, entry points, and 3 immediate action steps." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center glass-card rounded-2xl p-8 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-accent-gradient text-accent-foreground flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-md">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get (Free) */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="section-badge bg-primary/10 text-primary mx-auto mb-4">
              <FileText className="h-3 w-3" />
              Free Report
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Your Free Report Includes
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything a pest control expert would assess on a first visit — powered by AI, delivered instantly.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { icon: Target, title: "Rodent Identification", desc: "Species identified with behavioral profile, diet, and reproduction rate" },
              { icon: BarChart3, title: "Severity Score (1-10)", desc: "Visual gauge with plain-language explanation of your infestation level" },
              { icon: Shield, title: "Health Risk Assessment", desc: "Specific risks based on your rodent species, home, and household" },
              { icon: MapPin, title: "Entry Point Analysis", desc: "Most probable entry points based on your home type and layout" },
              { icon: Calculator, title: "Population Projection", desc: "Estimated current count and 30-day growth if untreated" },
              { icon: Zap, title: "3 Immediate Actions", desc: "Specific, actionable steps you can do TONIGHT to start fighting back" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card-elevated rounded-xl p-6 hover:shadow-xl transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="text-center mt-14">
            <Link to="/quiz">
              <Button variant="hero" size="xl" className="shadow-xl">
                Get Your Free Report Now
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="section-badge bg-accent/10 text-accent mx-auto mb-4">
              <Star className="h-3 w-3" />
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Real Results from Real Homeowners
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-elevated rounded-2xl p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="text-sm text-foreground leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                  <span className="text-[10px] bg-success/10 text-success px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide">
                    {t.result}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="section-badge bg-accent/10 text-accent mx-auto mb-4">
              <Sparkles className="h-3 w-3" />
              Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start free. Upgrade only if you want the complete elimination masterplan.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {/* Free */}
            <motion.div {...fadeUp} className="glass-card-elevated rounded-2xl p-8">
              <h3 className="font-display font-bold text-xl text-foreground mb-1">Free</h3>
              <div className="text-4xl font-display font-bold text-foreground mb-1">$0</div>
              <p className="text-sm text-muted-foreground mb-8">Always free, no signup</p>
              <ul className="space-y-3 mb-8">
                {[
                  "16-question smart diagnostic",
                  "Severity score (1-10)",
                  "Species identification",
                  "Health risk assessment",
                  "Entry point analysis",
                  "3 immediate action steps",
                  "Downloadable PDF report",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/quiz">
                <Button variant="outline" className="w-full" size="lg">Start Free Quiz</Button>
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              {...fadeUp}
              className="premium-card rounded-2xl p-8"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-premium-gradient text-accent-foreground text-xs font-bold px-5 py-1.5 rounded-full shadow-lg">
                MOST POPULAR
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-1">Pro Report</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold text-foreground">$9.99</span>
                <span className="text-sm text-muted-foreground">one-time</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8 mt-1">Everything you need to eliminate mice</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Free",
                  "Room-by-room strategy",
                  "Exact product shopping list",
                  "Day-by-day elimination protocol",
                  "CDC decontamination guide",
                  "Entry point sealing blueprint",
                  "Pro branded PDF report",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/quiz">
                <Button variant="premium" className="w-full" size="lg">
                  Get Pro Report
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </motion.div>

            {/* Premium */}
            <motion.div {...fadeUp} className="glass-card-elevated rounded-2xl p-8">
              <h3 className="font-display font-bold text-xl text-foreground mb-1">Premium</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold text-foreground">$19.99</span>
                <span className="text-sm text-muted-foreground">/year</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8 mt-1">Ongoing protection & support</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Pro",
                  "Email follow-up series (Day 1, 7, 30)",
                  "Seasonal prevention checklists",
                  "30-day re-assessment",
                  "Priority email support",
                  "Lifetime report updates",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/quiz">
                <Button variant="default" className="w-full" size="lg">Get Premium</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Free Tools */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="section-badge bg-primary/10 text-primary mx-auto mb-4">
              <Calculator className="h-3 w-3" />
              Free Tools
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Free Tools — No Quiz Required
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Standalone tools to help you understand and combat your mouse problem.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <motion.div {...fadeUp}>
              <Link to="/tools/calculator" className="block glass-card-elevated rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/15 transition-colors">
                  <Calculator className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">Infestation Growth Calculator</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">See how fast mice multiply. Enter your estimate and watch the population explode over 12 months.</p>
                <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Try it free <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>

            <motion.div {...fadeUp}>
              <Link to="/tools/entry-points" className="block glass-card-elevated rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/15 transition-colors">
                  <MapPin className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">Entry Point Finder</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">Select your home type to find every common mouse entry point with sealing instructions.</p>
                <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Find entry points <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card-elevated rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-foreground pr-4">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-5 pb-5 pt-0"
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(38_85%_55%/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(152_45%_30%/0.3),transparent_50%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-5 leading-tight">
              Every Day You Wait,<br />the Problem Gets Worse
            </h2>
            <p className="text-primary-foreground/50 mb-10 max-w-xl mx-auto leading-relaxed">
              A single pair of mice can produce 12,000 descendants in a year. Start your free diagnosis now and take back control tonight.
            </p>
            <Link to="/quiz">
              <Button variant="premium" size="xl" className="shadow-2xl">
                Start Free Diagnosis Now
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </Link>
            <p className="text-primary-foreground/30 text-xs mt-5">Free forever &middot; No credit card &middot; Instant results</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
