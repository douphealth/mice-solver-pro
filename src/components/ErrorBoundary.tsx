import { Component, type ErrorInfo, type ReactNode } from "react";

/** Last line of defence: show a calm, useful screen instead of a blank page if something throws while rendering. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Nothing is sent anywhere. Visible in the browser console for debugging.
    console.error("Render error:", error.message, info.componentStack?.split("\n")[1]?.trim());
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm" role="alert">
          <h1 className="font-display text-2xl font-bold">Something went wrong on this page</h1>
          <p className="mt-3 text-muted-foreground">Your answers and progress are saved on this device. Reloading usually fixes it.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground">Reload page</button>
            <a href="/" className="rounded-lg border px-5 py-2.5 font-semibold text-primary">Back to home</a>
          </div>
        </div>
      </main>
    );
  }
}
