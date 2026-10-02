import { DoorOpen, Search, SprayCan, Target, type LucideProps } from "lucide-react";
import type { ToolMeta } from "@/lib/site";

const ICONS = { Search, DoorOpen, Target, SprayCan };
export function ToolIcon({ name, ...props }: { name: ToolMeta["icon"] } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" {...props} />;
}
