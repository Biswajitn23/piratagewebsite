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
import LegalPlaceholder from "./pages/LegalPlaceholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ExperienceSettingsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SiteLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/code-of-conduct"
                element={<LegalPlaceholder type="code-of-conduct" />}
              />
              <Route path="/privacy" element={<LegalPlaceholder type="privacy" />} />
              <Route path="/sponsors" element={<LegalPlaceholder type="sponsors" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SiteLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ExperienceSettingsProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
