import { useEffect, useRef } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: InstanceType<typeof Lenis>;
  }
}

export function useLenisSmoothScroll(
  options?: ConstructorParameters<typeof Lenis>[0],
) {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    // Do not initialize Lenis on mobile to avoid touch/scroll capture and jank
    if (reduceMotion || isMobile) {
      return;
    }

    const lenis = new Lenis({
      duration: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      infinite: false,
      autoRaf: false,
      ...options,
    } as any);

    window.__lenis = lenis;

    let rafId = 0;
    let usingGsap = false;
    let gsapTickerFn: ((time: number) => void) | null = null;

    const startFallbackRaf = () => {
      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    };

    Promise.all([
      import(/* @vite-ignore */ "gsap"),
      import(/* @vite-ignore */ "gsap/ScrollTrigger"),
    ])
      .then(([gsapMod, scrollTriggerMod]) => {
        const gsap = (gsapMod as any).default || gsapMod;
        const ScrollTrigger =
          (scrollTriggerMod as any).ScrollTrigger ||
          (scrollTriggerMod as any).default;
        if (!gsap || !ScrollTrigger) return;

        gsap.registerPlugin(ScrollTrigger);

        // Tie ScrollTrigger to Lenis
        lenis.on("scroll", () => ScrollTrigger.update());
        ScrollTrigger.scrollerProxy(document.documentElement, {
          scrollTop(value?: number) {
            if (arguments.length && typeof value === "number") {
              lenis.scrollTo(value, { immediate: true });
            }
            return window.scrollY || document.documentElement.scrollTop;
          },
          getBoundingClientRect() {
            return {
              top: 0,
              left: 0,
              width: window.innerWidth,
              height: window.innerHeight,
            } as DOMRect;
          },
          pinType: document.body.style.transform ? "transform" : "fixed",
        });

        gsapTickerFn = (time: number) => {
          lenis.raf(time * 1000);
        };
        gsap.ticker.add(gsapTickerFn);
        gsap.ticker.lagSmoothing(0);
        usingGsap = true;

        // Ensure ScrollTrigger measures with our proxy
        ScrollTrigger.refresh();
      })
      .catch(() => {
        // gsap not available, use fallback RAF
      })
      .finally(() => {
        if (!usingGsap) {
          startFallbackRaf();
        }
      });

    return () => {
      cancelAnimationFrame(rafId);
      try {
        import("gsap").then((gsapMod) => {
          const gsap = (gsapMod as any).default || gsapMod;
          if (gsap?.ticker && gsapTickerFn) {
            gsap.ticker.remove(gsapTickerFn);
          }
        });
      } catch {}
      lenis.destroy();
      delete window.__lenis;
    };
  }, [options]);
}
