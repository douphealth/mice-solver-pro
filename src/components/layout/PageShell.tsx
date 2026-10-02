import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/** Header, main landmark and footer shared by every page. */
export default function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main id="main" tabIndex={-1} className={`flex-1 outline-none ${className}`}>{children}</main>
      <SiteFooter />
    </div>
  );
}
