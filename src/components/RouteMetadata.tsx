import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const titles: Record<string, string> = { "/": "Personalized Mouse Control Planner", "/quiz": "Build a Mouse Control Plan", "/tools/calculator": "Observation and Action Planner", "/tools/entry-points": "Entry-Gap Inspection Checklist" };
export default function RouteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const indexable = Object.prototype.hasOwnProperty.call(titles, pathname);
    document.title = `${titles[pathname] || "Private Planning Page"} | MiceGoneGuide`;
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    robots.content = indexable ? "index, follow" : "noindex, follow";
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `https://elimination.micegoneguide.com${pathname}`;
    const og = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (og) og.content = `https://elimination.micegoneguide.com${pathname}`;
  }, [pathname]);
  return null;
}
