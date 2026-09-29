import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, ShieldCheck, ArrowRight, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import type { ReportData } from "@/lib/report-generator";
import type { QuizAnswers } from "@/lib/quiz-data";

interface Props {
  report: ReportData;
  answers: QuizAnswers;
  capturedEmail?: string;
  isPro?: boolean;
  onDownloadPro?: () => void;
}
interface Offer { active: boolean; unitAmount: number; currency: string; livemode: boolean; }

export default function ReportPremiumPreview({ report, answers, capturedEmail, isPro=false, onDownloadPro }: Props) {
  const [loading,setLoading]=useState(false);
  const [offer,setOffer]=useState<Offer|null>(null);
  const [offerError,setOfferError]=useState("");

  useEffect(()=>{
    if(isPro) return;
    fetch("/api/offer",{headers:{Accept:"application/json"},cache:"no-store"})
      .then(async r=>{ const b=await r.json().catch(()=>null); if(!r.ok||!b?.active) throw new Error(b?.error||"Secure checkout is unavailable."); return b; })
      .then(setOffer)
      .catch(e=>setOfferError(e?.message||"Secure checkout is unavailable."));
  },[isPro]);

  const priceLabel=useMemo(()=>{
    if(!offer) return "";
    try { return new Intl.NumberFormat(undefined,{style:"currency",currency:offer.currency.toUpperCase()}).format(offer.unitAmount/100); }
    catch { return "$" + (offer.unitAmount/100).toFixed(2) + " " + offer.currency.toUpperCase(); }
  },[offer]);

  const handleCheckout=async()=>{
    if(!offer||offerError) return;
    setLoading(true);
    trackEvent("premium_checkout_clicked",{severity:report.severity,species:report.species.name});
    try{
      const r=await fetch("/api/create-checkout",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({
        answers,severity:report.severity,species:report.species.name,email:capturedEmail||undefined
      })});
      const b=await r.json().catch(()=>null);
      if(!r.ok||!b?.url) throw new Error(b?.error||"Unable to start secure checkout.");
      trackEvent("premium_checkout_started",{amount:b.amountTotal??offer.unitAmount,currency:b.currency??offer.currency});
      window.location.assign(b.url);
    }catch(e:any){
      toast({title:"Checkout unavailable",description:e?.message||"Please try again.",variant:"destructive"});
      setLoading(false);
    }
  };

  if(isPro){
    return <motion.section className="glass-card-elevated rounded-2xl p-6 md:p-8 border border-accent/30" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 text-accent text-sm font-semibold"><ShieldCheck className="h-4 w-4"/>Verified Pro access</div>
          <h2 className="text-2xl font-display font-bold mt-1">Complete Elimination Masterplan</h2>
        </div>
        {onDownloadPro&&<Button variant="premium" onClick={onDownloadPro} className="gap-2"><Download className="h-4 w-4"/>Download Pro PDF</Button>}
      </div>
      <div className="space-y-8">
        <section><h3 className="font-bold mb-3">Room-by-room strategy</h3><div className="space-y-2">{report.roomByRoomStrategy.map((x,i)=><div key={i} className="rounded-xl border p-4 text-sm">{x}</div>)}</div></section>
        <section><h3 className="font-bold mb-3">Personalized shopping list</h3><div className="grid sm:grid-cols-2 gap-3">{report.shoppingList.map((x,i)=><div key={i} className="rounded-xl border p-4"><p className="font-semibold text-sm">{x.name}</p><p className="text-xs text-muted-foreground mt-1">{x.reason}</p></div>)}</div></section>
        <section><h3 className="font-bold mb-3">30-day timeline</h3><div className="space-y-2">{report.eliminationTimeline.map((x,i)=><div key={i} className="rounded-xl border p-4"><p className="font-semibold text-sm">{x.day}</p><p className="text-sm text-muted-foreground">{x.action}</p></div>)}</div></section>
        <section><h3 className="font-bold mb-3">Cleanup protocol</h3><ol className="space-y-2">{report.decontaminationSteps.map((x,i)=><li key={i} className="rounded-xl border p-4 text-sm">{i+1}. {x}</li>)}</ol></section>
        <section><h3 className="font-bold mb-3">12-month prevention calendar</h3><div className="grid sm:grid-cols-2 gap-3">{report.preventionCalendar.map(x=><div key={x.month} className="rounded-xl border p-4"><p className="font-semibold text-sm">{x.month}</p><p className="text-sm text-muted-foreground">{x.task}</p></div>)}</div></section>
      </div>
    </motion.section>;
  }

  return <motion.section className="glass-card-elevated rounded-2xl p-8 text-center" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
    <div className="inline-flex items-center gap-2 text-sm font-semibold text-accent mb-4"><ShieldCheck className="h-4 w-4"/>Secure Stripe checkout</div>
    <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">Unlock the Complete Mouse Elimination Masterplan</h3>
    <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">Get the full room-by-room plan, product decision support, cleanup protocol, 30-day timeline, prevention calendar, and Pro PDF generated from your diagnostic answers.</p>
    <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto text-left mb-7 text-xs">
      {["Room-by-room strategy","Personalized shopping list","30-day action timeline","Cleanup protocol","12-month prevention calendar","Downloadable Pro PDF"].map(x=><div key={x} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-accent shrink-0"/>{x}</div>)}
    </div>
    <Button variant="premium" size="xl" onClick={handleCheckout} disabled={loading||!offer||!!offerError}>
      {loading?<Loader2 className="h-5 w-5 mr-1 animate-spin"/>:<Lock className="h-5 w-5 mr-1"/>}
      {loading?"Opening secure checkout...":offerError?"Checkout temporarily unavailable":offer?"Unlock Full Plan — " + priceLabel:"Checking secure price..."}
      {!loading&&offer&&!offerError&&<ArrowRight className="h-4 w-4 ml-1"/>}
    </Button>
    {offerError&&<p className="text-xs text-destructive mt-3">{offerError}</p>}
  </motion.section>;
}
