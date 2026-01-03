import { useEffect } from "react";

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

/** Lightweight performance monitor for local debugging on mobile */
export function usePerfMonitor({ enabled = true, logAfterMs = 6000 } = {}) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || typeof PerformanceObserver === "undefined") {
      return;
    }

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) return;

    const stats = {
      longTasks: 0,
      longTaskTotal: 0,
      lcp: 0,
      fcp: 0,
      cls: 0,
    };

    const observers: PerformanceObserver[] = [];

    // Long tasks (TBT/INP clues)
    if (PerformanceObserver.supportedEntryTypes?.includes("longtask")) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          stats.longTasks += 1;
          stats.longTaskTotal += entry.duration;
        }
      });
      longTaskObserver.observe({ type: "longtask", buffered: true });
      observers.push(longTaskObserver);
    }

    // Largest Contentful Paint
    if (PerformanceObserver.supportedEntryTypes?.includes("largest-contentful-paint")) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const entry = entries[entries.length - 1];
        if (entry) stats.lcp = entry.startTime;
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      observers.push(lcpObserver);
    }

    // First Contentful Paint
    if (PerformanceObserver.supportedEntryTypes?.includes("paint")) {
      const fcpObserver = new PerformanceObserver((list) => {
        const fcp = list.getEntries().find((e) => e.name === "first-contentful-paint");
        if (fcp) stats.fcp = fcp.startTime;
      });
      fcpObserver.observe({ type: "paint", buffered: true });
      observers.push(fcpObserver);
    }

    // Cumulative Layout Shift
    if (PerformanceObserver.supportedEntryTypes?.includes("layout-shift")) {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as LayoutShift;
          if (!shift.hadRecentInput) stats.cls += shift.value;
        }
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
      observers.push(clsObserver);
    }

    const timer = window.setTimeout(() => {
      // Log a compact summary to the console
      console.log("[Perf][Mobile]", {
        FCP_ms: Math.round(stats.fcp || 0),
        LCP_ms: Math.round(stats.lcp || 0),
        CLS: Number(stats.cls.toFixed(3)),
        longTasks: stats.longTasks,
        longTaskTotal_ms: Math.round(stats.longTaskTotal),
      });
    }, logAfterMs);

    return () => {
      window.clearTimeout(timer);
      observers.forEach((o) => o.disconnect());
    };
  }, [enabled, logAfterMs]);
}

export default usePerfMonitor;
