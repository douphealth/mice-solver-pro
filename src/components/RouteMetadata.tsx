import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SEO } from "@/lib/site";
import { SITE_ORIGIN } from "@/lib/sources";

function setMeta(selector: string, create: () => HTMLElement, apply: (el: HTMLElement) => void) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) { el = create(); document.head.appendChild(el); }
  apply(el);
}

/** Keeps title, description, canonical, robots and social tags in step with the current route. */
export default function RouteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const route = pathname.replace(/\/+$/, "") || "/";
    const known = SEO[route];
    const title = `${known?.title ?? "Page not found"} | MiceGoneGuide`;
    const description = known?.description ?? "This page doesn't exist. Build a free mouse control plan instead.";
    const indexable = known?.index ?? false;
    const canonical = `${SITE_ORIGIN}${route === "/" ? "/" : route}`;
    document.title = title;
    setMeta('meta[name="description"]', () => Object.assign(document.createElement("meta"), { name: "description" }), el => el.setAttribute("content", description));
    setMeta('meta[name="robots"]', () => Object.assign(document.createElement("meta"), { name: "robots" }), el => el.setAttribute("content", indexable ? "index, follow" : "noindex, follow"));
    setMeta('link[rel="canonical"]', () => Object.assign(document.createElement("link"), { rel: "canonical" }), el => el.setAttribute("href", canonical));
    for (const [prop, value] of [["og:url", canonical], ["og:title", title], ["og:description", description]] as const) {
      setMeta(`meta[property="${prop}"]`, () => { const m = document.createElement("meta"); m.setAttribute("property", prop); return m; }, el => el.setAttribute("content", value));
    }
    for (const [name, value] of [["twitter:title", title], ["twitter:description", description]] as const) {
      setMeta(`meta[name="${name}"]`, () => Object.assign(document.createElement("meta"), { name }), el => el.setAttribute("content", value));
    }
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);
  return null;
}
