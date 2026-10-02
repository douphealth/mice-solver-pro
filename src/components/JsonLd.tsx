import { useEffect } from "react";

/** Injects a JSON-LD block for the current page and removes it on unmount. Only use it for content that is visible on the page. */
export default function JsonLd({ id, data }: { id: string; data: unknown }) {
  useEffect(() => {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = `ld-${id}`;
    el.text = JSON.stringify(data);
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, [id, data]);
  return null;
}
