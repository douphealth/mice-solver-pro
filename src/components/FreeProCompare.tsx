import { Check, Minus } from "lucide-react";
import { PRO_PRICE_LABEL } from "@/lib/api";

/** What the free plan and Pro each include. One list, used on the home page, the plan page and the Pro page. */
export const COMPARE: [string, string | boolean, string | boolean][] = [
  ["Personalised action plan: today, this week, ongoing", true, true],
  ["Safe cleanup, trap placement and entry-gap guides", true, true],
  ["Printable PDF of your plan", true, true],
  ["Calendar reminders for trap checks", "14 days", "Full 30-day schedule"],
  ["Dated 30-day schedule tailored to your answers", false, true],
  ["Room-by-room protocols", "Short prompts", "Full protocols"],
  ["Trap layout helper (UC IPM spacing)", false, true],
  ["Evidence log with weekly chart and CSV export", false, true],
  ["Supply checklist and sealing materials guide", "Basics", "Detailed"],
  ["When-to-call-a-pro kit and seasonal calendar", false, true],
  ["Pro PDF workbook with log sheets", false, true],
];

const Cell = ({ v }: { v: string | boolean }) =>
  v === true ? <Check className="mx-auto h-5 w-5 text-success" aria-label="Included" /> : v === false ? <Minus className="mx-auto h-5 w-5 text-muted-foreground/50" aria-label="Not included" /> : <span className="text-xs font-medium leading-snug sm:text-sm">{v}</span>;

export default function FreeProCompare({ className = "" }: { className?: string }) {
  // One table at every width: narrow value columns and wrapping labels keep it inside a 375px screen without sideways scrolling.
  return (
    <div className={`card-soft overflow-hidden ${className}`}>
      <table className="w-full table-fixed text-left">
        <caption className="sr-only">Comparison of the free plan and the Pro Masterplan</caption>
        <thead>
          <tr className="border-b bg-secondary/60">
            <th scope="col" className="p-2.5 text-xs font-semibold sm:p-4 sm:text-sm">What's included</th>
            <th scope="col" className="w-[4.75rem] p-2.5 text-center text-xs font-semibold sm:w-36 sm:p-4 sm:text-sm">Free</th>
            <th scope="col" className="w-[5.5rem] bg-[hsl(41_100%_60%/0.18)] p-2.5 text-center text-xs font-bold sm:w-44 sm:p-4 sm:text-sm">Pro<span className="block font-semibold sm:inline"><span className="hidden sm:inline"> · </span>{PRO_PRICE_LABEL}</span></th>
          </tr>
        </thead>
        <tbody>
          {COMPARE.map(([label, free, pro]) => (
            <tr key={label} className="border-b last:border-0">
              <th scope="row" className="p-2.5 text-[13px] font-medium leading-snug sm:p-4 sm:text-sm">{label}</th>
              <td className="p-2.5 text-center sm:p-4"><Cell v={free} /></td>
              <td className="bg-[hsl(41_100%_60%/0.08)] p-2.5 text-center sm:p-4"><Cell v={pro} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
