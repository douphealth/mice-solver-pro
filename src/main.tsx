import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { reloadOnce } from "./lib/lazy";

// Vite fires this when a preloaded chunk or stylesheet is missing (e.g. a tab opened before the latest deploy).
window.addEventListener("vite:preloadError", () => { reloadOnce(); });

createRoot(document.getElementById("root")!).render(<App />);
