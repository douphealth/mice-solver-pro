import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";

interface EntryPoint {
  id: string;
  name: string;
  risk: "high" | "medium" | "low";
  description: string;
  howToSeal: string;
}

const homeTypes: Record<string, { label: string; icon: string; points: EntryPoint[] }> = {
  detached: {
    label: "Detached House",
    icon: "🏡",
    points: [
      { id: "foundation", name: "Foundation Cracks & Gaps", risk: "high", description: "Any crack wider than ¼ inch in your foundation is a highway for mice. They're especially common where the foundation meets the siding.", howToSeal: "Fill small cracks with hydraulic cement. For larger gaps, stuff with copper mesh (not steel wool — it rusts outdoors) and seal over with exterior-grade caulk." },
      { id: "pipes", name: "Utility Pipe Penetrations", risk: "high", description: "Where gas, water, and electrical lines enter your home, there's almost always a gap. This is the #1 most common entry point.", howToSeal: "Stuff steel wool tightly around the pipe, then seal with fire-rated expanding foam or caulk. For larger gaps, use a metal escutcheon plate." },
      { id: "garage_door", name: "Garage Door Seal", risk: "high", description: "The rubber seal at the bottom of garage doors degrades over time, creating gaps mice easily exploit — especially in corners.", howToSeal: "Replace worn weatherstripping with a new rubber garage door seal. Add brush seals to the sides. Consider a threshold seal for a tight bottom closure." },
      { id: "dryer_vent", name: "Dryer Vent & Exhaust Fans", risk: "medium", description: "Exterior vent covers with open flaps are easy for mice to push through, especially dryer vents that blow warm air (attractive in winter).", howToSeal: "Install pest-proof vent covers with fine mesh screens (¼ inch or smaller). Replace plastic vent covers with metal ones." },
      { id: "door_sweeps", name: "Door Sweeps & Thresholds", risk: "medium", description: "The gap under exterior doors is often overlooked. If you can see daylight under your door, a mouse can get through.", howToSeal: "Install door sweeps on all exterior doors. Use a combination sweep with a brush or rubber seal for uneven thresholds." },
      { id: "roof_vents", name: "Roof Vents & Soffit Gaps", risk: "medium", description: "Roof vents, soffit vents, and gaps where the roof meets the walls are common entry points, especially for roof rats.", howToSeal: "Install hardware cloth (¼ inch mesh) over all roof and soffit vents. Seal gaps at the roofline with metal flashing." },
    ],
  },
  apartment: {
    label: "Apartment / Condo",
    icon: "🏢",
    points: [
      { id: "kitchen_pipes", name: "Under-Sink Pipe Gaps", risk: "high", description: "The #1 entry point in apartments. Pipes under kitchen and bathroom sinks pass through the wall, and there's almost always a gap around them.", howToSeal: "Stuff steel wool tightly around pipes where they enter the wall. Cover with caulk. Ask your landlord to do both sides of the wall for maximum effect." },
      { id: "outlets", name: "Electrical Outlet Gaps", risk: "medium", description: "Outlets on shared walls often have gaps behind the cover plate that connect to wall voids — and your neighbor's unit.", howToSeal: "Remove outlet covers and install foam gasket insulators behind them. Seal any visible gaps around the electrical box with fire-rated caulk." },
      { id: "baseboard", name: "Baseboard & Wall Gaps", risk: "medium", description: "Gaps between the baseboard and floor, or where walls meet, can hide entry points — especially in older buildings.", howToSeal: "Run a bead of caulk along the baseboard-floor junction. Check corners and closets carefully." },
      { id: "hvac", name: "HVAC Vents & Chases", risk: "medium", description: "Heating and cooling ducts run between floors and units. Gaps around registers and in utility closets are common highways.", howToSeal: "Seal gaps around HVAC registers with caulk. Report large gaps in utility closets to your building manager." },
      { id: "front_door", name: "Front Door Gap", risk: "low", description: "The gap under your apartment door may allow mice access from the hallway, especially in buildings with known issues.", howToSeal: "Install an adhesive door sweep or draft stopper. Won't damage the door and is renter-friendly." },
    ],
  },
  townhouse: {
    label: "Townhouse / Row Home",
    icon: "🏘️",
    points: [
      { id: "shared_walls", name: "Shared Wall Penetrations", risk: "high", description: "Pipes, wires, and ductwork that pass through shared walls with adjacent units create highways for mice traveling between homes.", howToSeal: "Seal all visible gaps around pipes and wires on your side of shared walls with steel wool and caulk. Coordinate with neighbors for best results." },
      { id: "pipes", name: "Utility Pipe Entries", risk: "high", description: "Where plumbing and gas lines enter from the exterior or basement. Often larger gaps due to stacked construction.", howToSeal: "Steel wool + caulk for small gaps. Expanding foam for larger voids. Metal plates for the biggest openings." },
      { id: "basement_walls", name: "Basement/Crawlspace Gaps", risk: "high", description: "Shared basements or crawlspaces in row homes mean mice can travel the entire block underground.", howToSeal: "Seal all basement wall penetrations. Install door sweeps on basement access doors. Consider hardware cloth over crawlspace vents." },
      { id: "garage_door", name: "Attached Garage Entry", risk: "medium", description: "The door between your garage and living space, plus the garage door seal itself.", howToSeal: "Weatherstrip the interior garage door. Replace worn garage door bottom seals." },
      { id: "dryer_vent", name: "Exterior Vents", risk: "medium", description: "Dryer vents, bathroom fans, and kitchen exhaust vents on exterior walls.", howToSeal: "Install pest-proof vent covers with ¼ inch mesh screening." },
    ],
  },
};

export default function EntryPointsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [expandedPoint, setExpandedPoint] = useState<string | null>(null);

  const home = selected ? homeTypes[selected] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-10 md:py-16 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <span className="text-4xl mb-3 block">🏠</span>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Mouse Entry Point Finder
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Select your home type to see every common entry point mice use — with exact sealing instructions.
            </p>
          </div>

          {/* Home type selector */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {Object.entries(homeTypes).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setSelected(key); setExpandedPoint(null); }}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  selected === key
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span className="text-3xl mb-1">{val.icon}</span>
                <span className="text-xs font-medium text-foreground text-center">{val.label}</span>
              </button>
            ))}
          </div>

          {/* Entry points */}
          <AnimatePresence mode="wait">
            {home && (
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {home.points.map((point) => (
                  <div key={point.id} className="glass-card rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedPoint(expandedPoint === point.id ? null : point.id)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div className={`w-3 h-3 rounded-full shrink-0 ${
                        point.risk === "high" ? "bg-destructive" : point.risk === "medium" ? "bg-warning" : "bg-success"
                      }`} />
                      <div className="flex-1">
                        <span className="font-medium text-foreground text-sm">{point.name}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          point.risk === "high" ? "bg-destructive/10 text-destructive" : point.risk === "medium" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                        }`}>
                          {point.risk} risk
                        </span>
                      </div>
                      <span className="text-muted-foreground text-xs">{expandedPoint === point.id ? "▲" : "▼"}</span>
                    </button>

                    <AnimatePresence>
                      {expandedPoint === point.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">What to look for</h4>
                              <p className="text-sm text-foreground">{point.description}</p>
                            </div>
                            <div className="bg-primary/5 rounded-lg p-3">
                              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">How to seal it</h4>
                              <p className="text-sm text-foreground">{point.howToSeal}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <div className="text-center pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Want a personalized entry point analysis for YOUR specific home?
                  </p>
                  <Link to="/quiz">
                    <Button variant="hero" size="lg">
                      Get Free Personalized Report <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
