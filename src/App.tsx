import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RouteMetadata from "./components/RouteMetadata";

const QuizPage = lazy(() => import("./pages/QuizPage"));
const PlanPage = lazy(() => import("./pages/PlanPage"));
const CalculatorPage = lazy(() => import("./pages/CalculatorPage"));
const EntryPointsPage = lazy(() => import("./pages/EntryPointsPage"));
const TrapPlacementPage = lazy(() => import("./pages/TrapPlacementPage"));
const CleanupGuidePage = lazy(() => import("./pages/CleanupGuidePage"));
const ProPage = lazy(() => import("./pages/ProPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const RestorePage = lazy(() => import("./pages/RestorePage"));
const PrivacyPage = lazy(() => import("./pages/LegalPages").then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("./pages/LegalPages").then(m => ({ default: m.TermsPage })));

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Loading">
    <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
  </div>
);

const App = () => (
  <BrowserRouter>
    <RouteMetadata />
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/report" element={<Navigate to="/plan" replace />} />
        <Route path="/tools/calculator" element={<CalculatorPage />} />
        <Route path="/tools/entry-points" element={<EntryPointsPage />} />
        <Route path="/tools/trap-placement" element={<TrapPlacementPage />} />
        <Route path="/tools/cleanup-guide" element={<CleanupGuidePage />} />
        <Route path="/pro" element={<ProPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/restore" element={<RestorePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
