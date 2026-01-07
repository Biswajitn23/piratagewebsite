import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import HeroScene from "@/components/pirtatage/HeroScene";
import MobileHeroScene from "@/components/pirtatage/MobileHeroScene";
import { useExperienceSettings } from "@/contexts/ExperienceSettingsContext";
import { useLayoutBridge } from "@/contexts/LayoutBridgeContext";
import useWebGL from "@/hooks/use-webgl";

// Blinking line component
const BlinkingLine = () => {
  const [opacity, setOpacity] = useState(1);
  
  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame++;
      // Sine wave for smooth fade: 1 -> 0.1 -> 1 (increased speed for mobile)
      const newOpacity = 0.55 + 0.45 * Math.sin(frame * 0.06);
      setOpacity(newOpacity);
      requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);
  
  return (
    <div 
      className="sm:hidden h-1 w-24 bg-accent rounded-full" 
      aria-hidden="true"
      style={{ 
        opacity,
        transition: 'opacity 0.05s ease-out'
      }}
    />
  );
};

// Defer GSAP plugin registration to idle time
let gsapInitialized = false;
const initGSAP = () => {
  if (gsapInitialized) return;
  try {
    (gsap as any).registerPlugin(ScrollTrigger);
    gsapInitialized = true;
  } catch {}
};

const HeroSection = () => {
  const { settings } = useExperienceSettings();
  const webglSupported = useWebGL();
  const { openJoinDialog } = useLayoutBridge();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [pointerIntensity, setPointerIntensity] = useState(0.4);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  // Glitch effect is now handled by GlitchScrollEffect

  useEffect(() => {
    const mm = window.matchMedia("(max-width: 768px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const isMobileDevice = mm.matches;
      setIsMobile(isMobileDevice);
      setPrefersReducedMotion(rm.matches);
      console.log('Mobile detected:', isMobileDevice);
    };
    update();
    mm.addEventListener("change", update, { passive: true });
    rm.addEventListener("change", update, { passive: true });
    return () => {
      mm.removeEventListener("change", update);
      rm.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    // Skip GSAP animations only on mobile (keep on desktop)
    if (!rootRef.current || !settings.motionEnabled || isMobile) {
      return;
    }

    // On desktop: init GSAP immediately (no idle defer needed for desktop)
    initGSAP();
    const ctx = gsap.context(() => {
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
  }, [settings.motionEnabled, isMobile]);

  const handlePointerMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // Only skip on mobile
    if (!settings.motionEnabled || isMobile) {
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
  }, [settings.motionEnabled, isMobile]);

  const goToEvents = () => {
    navigate("/events");
  };

  return (
    <section
      id="overview"
      ref={rootRef}
      className="relative z-20 flex h-screen min-h-[100vh] w-full flex-col items-center justify-center overflow-hidden text-center px-3 sm:px-4 pt-16 sm:pt-20 pb-6 sm:pb-8"
      onMouseMove={handlePointerMove}
    >
      {/* Add a dark overlay for contrast to ensure text is always visible */}
      <div className="absolute inset-0 -z-30 bg-black/60 pointer-events-none" />
      <div className="absolute inset-0 -z-20">
        {isMobile ? (
          <MobileHeroScene fill />
        ) : webglSupported && settings.webglPreferred && !prefersReducedMotion ? (
          <HeroScene pointerIntensity={pointerIntensity} fill />
        ) : (
          <FallbackHeroVisual />
        )}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#060115] via-[#060115]/80 to-transparent" />

      <div
        className="relative z-0 w-full max-w-6xl px-4 sm:px-4 flex flex-col items-start md:items-center justify-center min-h-[100vh] sm:min-h-[80vh]"
      >
        <div className="space-y-6 sm:space-y-6 md:space-y-8 hero-content w-full max-w-5xl md:max-w-4xl text-left md:text-center">
          <h1 className="hero-headline font-display text-5xl md:text-6xl lg:text-7xl leading-tight text-glow text-left w-full whitespace-normal md:whitespace-nowrap md:-ml-32 mobile-white-glow md:purple-glow">
            Piratage : The Ethical Hacking Club
          </h1>
          <BlinkingLine />
          <div className="mt-3 sm:mt-4 inline-block md:block rounded-xl sm:rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-5 py-2.5 sm:px-4 sm:py-2 shadow-sm">
            <p className="m-0 text-2xl sm:text-xl md:text-2xl lg:text-3xl font-display font-semibold uppercase tracking-[0.1em] sm:tracking-[0.12em] text-accent/95 text-left md:text-center">
              Where Hackers become Protectors
            </p>
          </div>
          <p className="hero-subhead max-w-none sm:max-w-3xl text-lg sm:text-base md:text-lg text-muted-foreground px-1 sm:px-2 mt-4 sm:mt-6 text-left md:text-center leading-relaxed md:mx-auto">
            Piratage: University defenders turning curiosity into protection. We
            are the campus guild of ethical hackers crafting defenses, designing
            Hackathons, and teaching the next wave of guardians.
          </p>
          {/* Tighter gap to keep CTA closer on desktop */}
          <div className="mt-8 sm:mt-14 md:mt-10" />

          {/* WhatsApp panel removed per user request */}
        </div>
        <div className="flex flex-wrap items-center justify-start md:justify-center md:self-center md:max-w-max gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8 w-full">
          <Button
            size="lg"
            variant="ghost"
            className="hero-cta tilt-hover inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-4 sm:px-8 sm:py-6 text-xs sm:text-base font-semibold text-foreground md:desktop-hover-glow md:desktop-animate-glow-pulse"
            onClick={goToEvents}
          >
            <Play className="h-3 w-3 sm:h-5 sm:w-5" /> See Events
          </Button>
        </div>
      </div>
    </section>
  );
};

const FallbackHeroVisual = () => (
  <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-[#12062c] via-[#061127] to-[#080621]">
    <svg
      className="h-[420px] w-[420px] hidden md:block md:animate-pulse text-neon-teal/60"
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
    <div className="absolute inset-0 hidden md:block md:animate-[pulse_3s_ease-in-out_infinite] bg-gradient-to-br from-neon-purple/10 via-transparent to-neon-teal/10" />
    <style>{`
      @media (max-width: 768px) {
        .mobile-white-glow {
          text-shadow: 
            0 0 20px rgba(255, 255, 255, 0.9),
            0 0 40px rgba(255, 255, 255, 0.7),
            0 0 60px rgba(255, 255, 255, 0.5),
            0 0 80px rgba(255, 255, 255, 0.3);
          animation: pulse-white-glow 2s ease-in-out infinite;
        }
        
        @keyframes pulse-white-glow {
          0%, 100% {
            text-shadow: 
              0 0 20px rgba(255, 255, 255, 0.9),
              0 0 40px rgba(255, 255, 255, 0.7),
              0 0 60px rgba(255, 255, 255, 0.5),
              0 0 80px rgba(255, 255, 255, 0.3);
          }
          50% {
            text-shadow: 
              0 0 30px rgba(255, 255, 255, 1),
              0 0 60px rgba(255, 255, 255, 0.9),
              0 0 90px rgba(255, 255, 255, 0.7),
              0 0 120px rgba(255, 255, 255, 0.5);
          }
        }
      }
      
      @media (min-width: 769px) {
        .purple-glow {
          text-shadow: 0 0 28px rgba(138, 43, 226, 0.45);
          filter: drop-shadow(0 0 28px rgba(138, 43, 226, 0.45));
        }
      }
    `}</style>
  </div>
);

export default HeroSection;