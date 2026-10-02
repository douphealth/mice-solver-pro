import {
  AlertTriangle, ArrowDownToLine, Baby, BadgeCheck, Bath, BedDouble, BrickWall, Building, Building2, CalendarDays, CalendarRange, Car, Cat,
  CircleDashed, CookingPot, Dog, Eye, Fan, Footprints, Grip, HelpCircle, Home, Layers, Package, PackageCheck, Paintbrush, Radio, RotateCcw,
  Rows3, Scissors, Skull, Sofa, Sparkles, Sprout, Target, Tent, Truck, UserCheck, UtensilsCrossed, Volume2, WashingMachine, Wind, Wrench, Zap,
  type LucideIcon, type LucideProps,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  AlertTriangle, ArrowDownToLine, Baby, BadgeCheck, Bath, BedDouble, BrickWall, Building, Building2, CalendarDays, CalendarRange, Car, Cat,
  CircleDashed, CookingPot, Dog, Eye, Fan, Footprints, Grip, HelpCircle, Home, Layers, Package, PackageCheck, Paintbrush, Radio, RotateCcw,
  Rows3, Scissors, Skull, Sofa, Sparkles, Sprout, Target, Tent, Truck, UserCheck, UtensilsCrossed, Volume2, WashingMachine, Wind, Wrench, Zap,
};

export function OptionIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? HelpCircle;
  return <Icon aria-hidden="true" {...props} />;
}
