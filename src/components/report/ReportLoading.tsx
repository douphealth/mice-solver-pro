import Navbar from "@/components/Navbar";
export default function ReportLoading(_props: { factIndex?: number }) { return <div className="min-h-screen bg-background"><Navbar/><main className="container mx-auto px-4 py-12"><p role="status">Preparing your planning checklist...</p></main></div>; }
