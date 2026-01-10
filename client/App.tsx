import "./global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import SiteLayout from "@/components/layout/SiteLayout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ExperienceSettingsProvider } from "@/contexts/ExperienceSettingsContext";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Team from "./pages/Team";
import Gallery from "./pages/Gallery";
import Programs from "./pages/Programs";
import GetInvolved from "./pages/GetInvolved";
import LegalPlaceholder from "./pages/LegalPlaceholder";
import Sponsors from "./pages/sponsors";
import NotFound from "./pages/NotFound";
import { usePerfMonitor } from "@/hooks/use-perf-monitor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ExperienceSettingsProvider>
      {/* Log mobile performance in dev only; no impact on prod */}
      {import.meta.env.DEV && <PerfMonitorGuard />}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route
              path="/sponsors"
              element={<Sponsors />}
            />
            <Route
              path="*"
              element={
                <SiteLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/programs" element={<Programs />} />
                    <Route path="/get-involved" element={<GetInvolved />} />
                    <Route path="/code-of-conduct" element={<LegalPlaceholder type="code-of-conduct" />} />
                    <Route path="/privacy" element={<LegalPlaceholder type="privacy" />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SiteLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ExperienceSettingsProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

function PerfMonitorGuard() {
  usePerfMonitor({ enabled: true, logAfterMs: 6000 });
  return null;
}
