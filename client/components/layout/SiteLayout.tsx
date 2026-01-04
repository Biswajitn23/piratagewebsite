import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import AccessibilityPanel from "@/components/layout/AccessibilityPanel";
import JoinCrewDialog from "@/components/modals/JoinCrewDialog";
import { LayoutBridgeProvider } from "@/contexts/LayoutBridgeContext";
import { useLenisSmoothScroll } from "@/hooks/use-lenis";

const SiteLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  // Initialize Lenis smooth scrolling globally
  useLenisSmoothScroll();

  // Handle hash-based navigation with Lenis when available
  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const id = location.hash.replace("#", "");
    const target = document.getElementById(id);
    if (target) {
      requestAnimationFrame(() => {
        const lenis = (window as any).__lenis as
          | { scrollTo?: (el: Element | string, opts?: any) => void }
          | undefined;
        if (lenis?.scrollTo) {
          lenis.scrollTo(target, { offset: -12 });
        } else {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  }, [location.hash]);

  return (
    <LayoutBridgeProvider>
      {({
        openJoinDialog,
        closeJoinDialog,
        joinDialogOpen,
        openAccessibilityPanel,
        closeAccessibilityPanel,
        accessibilityPanelOpen,
        mobileNavOpen,
        setMobileNavOpen,
      }) => (
        <div className="relative flex min-h-screen flex-col">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:rounded-full focus:bg-white/10 focus:px-4 focus:py-2 focus:text-sm focus:uppercase focus:tracking-[0.3em]"
          >
            Skip to content
          </a>
          <SiteHeader
            onJoin={openJoinDialog}
            onAccessibility={openAccessibilityPanel}
            mobileNavOpen={mobileNavOpen}
            onMobileNavChange={setMobileNavOpen}
          />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter onJoin={openJoinDialog} />
          <JoinCrewDialog
            open={joinDialogOpen}
            onOpenChange={(open) =>
              open ? openJoinDialog() : closeJoinDialog()
            }
          />
          <AccessibilityPanel
            open={accessibilityPanelOpen}
            onOpenChange={(open) =>
              open ? openAccessibilityPanel() : closeAccessibilityPanel()
            }
          />
        </div>
      )}
    </LayoutBridgeProvider>
  );
};

export default SiteLayout;
