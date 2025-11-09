import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import HeroScene from "@/components/pirtatage/HeroScene";
import { useExperienceSettings } from "@/contexts/ExperienceSettingsContext";
import { useLayoutBridge } from "@/contexts/LayoutBridgeContext";
import useWebGL from "@/hooks/use-webgl";

// Register GSAP plugin safely (avoid typing issues with core.globals)
try {
  (gsap as any).registerPlugin(ScrollTrigger);
} catch {}

const HeroSection = () => {
  const { settings } = useExperienceSettings();
  const webglSupported = useWebGL();
  const { openJoinDialog } = useLayoutBridge();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [pointerIntensity, setPointerIntensity] = useState(0.4);

  useEffect(() => {
    if (!rootRef.current || !settings.motionEnabled) {
      return;
    }

    const ctx = gsap.context(() => {
      // Animate hero content when the section enters the viewport and also when
      // re-entering from below (scrolling up). toggleActions ensures play on
      // enter and play on enterBack.
      gsap.fromTo(
        ".hero-content > *",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 60%",
            toggleActions: "play reverse play reverse",
          },
        },
      );
    }, rootRef);

    return () => ctx.revert();
  }, [settings.motionEnabled]);

  const handlePointerMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!settings.motionEnabled) {
      return;
    }

    const { current } = rootRef;
    if (!current) {
      return;
    }
    const rect = current.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width;
    const relY = (event.clientY - rect.top) / rect.height;
    const centerDist = Math.sqrt((relX - 0.5) ** 2 + (relY - 0.5) ** 2);
    const intensity = Math.max(0.2, 1 - centerDist * 2.2);
    setPointerIntensity(intensity);
  }, [settings.motionEnabled]);

  const goToEvents = () => {
    if (document.getElementById("events")) {
      document.getElementById("events")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#events");
    }
  };

  return (
    <section
      id="overview"
      ref={rootRef}
      className="relative flex h-screen min-h-[700px] w-full flex-col items-center justify-center overflow-hidden  text-center"
      onMouseMove={handlePointerMove}
    >
      <div className="absolute inset-0 -z-20">
        {webglSupported && settings.webglPreferred ? (
          <HeroScene pointerIntensity={pointerIntensity} fill  />
        ) : (
          <FallbackHeroVisual />
        )}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#060115] via-[#060115]/80 to-transparent" />

      <div className="relative z-0">
  <div className="space-y-6 hero-content">
          <h1 className="hero-headline font-display text-4xl leading-tight text-glow drop-shadow-[0_0_28px_rgba(138,43,226,0.45)] sm:text-5xl lg:text-6xl">
            Piratage : The Ethical Hacking Club
          </h1>
          <div className="mt-4 inline-block rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-2 shadow-sm">
            <p className="m-0 text-xl sm:text-2xl lg:text-3xl font-display font-semibold uppercase tracking-[0.12em] text-accent/95">
              Where Hackers become Protectors
            </p>
          </div>
          <p className="hero-subhead mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Piratage: university defenders turning curiosity into protection. We
            are the campus guild of ethical hackers crafting defenses, designing
            CTFs, and teaching the next wave of guardians.
          </p>

          {/* WhatsApp panel removed per user request */}
  </div>
  <div className="flex flex-wrap items-center justify-center gap-4 mt-8 sm:mt-10">
          <Button
            size="lg"
            className="hero-cta tilt-hover rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-8 py-6 text-base font-semibold text-primary-foreground shadow-glow"
            onClick={openJoinDialog}
          >
            Join the Crew
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="hero-cta tilt-hover inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-6 text-base font-semibold text-foreground"
            onClick={goToEvents}
          >
            <Play className="h-5 w-5" /> See Events
          </Button>
        </div>
      </div>
    </section>
  );
};

const FallbackHeroVisual = () => (
  <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-[#12062c] via-[#061127] to-[#080621]">
    <svg
      className="h-[420px] w-[420px] animate-pulse text-neon-teal/60"
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeWidth="12"
      role="img"
      aria-label="Piratage shield"
    >
      <path d="M256 32L96 96v120c0 107.452 70.236 206.967 160 264 89.764-57.033 160-156.548 160-264V96L256 32Z" />
      <path d="M192 256l64 64 96-128" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="256" cy="176" r="36" />
    </svg>
    <div className="absolute inset-0 animate-[pulse_3s_ease-in-out_infinite] bg-gradient-to-br from-neon-purple/10 via-transparent to-neon-teal/10" />
  </div>
);

export default HeroSection;