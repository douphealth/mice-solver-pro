import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { reloadOnce } from "./lib/lazy";

// The git-connected Pages preview (*.pages.dev) has no API, so purchases can't be verified there. Send visitors to the real app.
if (/\.pages\.dev$/i.test(window.location.hostname)) {
  window.location.replace(`https://elimination.micegoneguide.com${window.location.pathname}${window.location.search}${window.location.hash}`);
}

// Vite fires this when a preloaded chunk or stylesheet is missing (e.g. a tab opened before the latest deploy).
window.addEventListener("vite:preloadError", () => { reloadOnce(); });

createRoot(document.getElementById("root")!).render(<App />);
