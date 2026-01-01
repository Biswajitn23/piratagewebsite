import { useEffect, useRef, useState } from "react";

import Preloader from "@/components/pirtatage/Preloader";
import EventsSection from "@/components/pirtatage/EventsSection";
import PiratageMarquee from "@/components/pirtatage/PiratageMarquee";
import HeroMarquee from "@/components/pirtatage/HeroMarquee";
import GallerySection from "@/components/pirtatage/GallerySection";
import GetInvolvedSection from "@/components/pirtatage/GetInvolvedSection";
import HeroSection from "@/components/pirtatage/HeroSection";
import MembersSection from "@/components/pirtatage/MembersSection";
import AboutSection from "@/components/pirtatage/AboutSection";
import BackgroundMusic from "@/components/BackgroundMusic";
import ProgramsSection from "@/components/pirtatage/ProgramsSection";

import { useExperienceSettings } from "@/contexts/ExperienceSettingsContext";

const Index = () => {
  const [preloadComplete, setPreloadComplete] = useState(false);
  const playedRef = useRef(false);
  const chimePlayedRef = useRef(false);
  const { settings } = useExperienceSettings();

  useEffect(() => {
    if (preloadComplete) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPreloadComplete(true);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [preloadComplete]);

  return (
    <div className="relative">
      <BackgroundMusic />
      {!preloadComplete ? (
        <Preloader
          onFinish={() => {
            setPreloadComplete(true);
            // Fallback chime if startup sound is enabled and dynamic sound failed
            if (settings.startupSoundEnabled && !chimePlayedRef.current) {
              const playChime = () => {
                try {
                  const Ctor = window.AudioContext || window.webkitAudioContext;oContext;
                  if (!Ctor) return;
                  const ctx = new Ctor();
                  const now = ctx.currentTime + 0.02;
                      const makeTone = (freq, start, dur, gain = 0.08) => {
                        const osc = ctx.createOscillator();
                        const g = ctx.createGain();
                        osc.type = "sine";
                        osc.frequency.value = freq;
                        osc.connect(g);
                        g.connect(ctx.destination);
                        g.gain.setValueAtTime(0, start);
                        g.gain.linearRampToValueAtTime(gain, start + 0.01);
                        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
                        osc.start(start);
                        osc.stop(start + dur + 0.02);
                      };
                      makeTone(587.33, now, 0.32); // D5, longer duration
                      makeTone(784.0, now + 0.32, 0.36); // G5, longer duration
                      setTimeout(() => ctx.close(), 1200);
                  chimePlayedRef.current = true;
                } catch {}
              };
              // Play on first user interaction after preloader
              const handler = () => {
                playChime();
                window.removeEventListener("pointerdown", handler);
                window.removeEventListener("keydown", handler);
              };
              window.addEventListener("pointerdown", handler, { once: true });
              window.addEventListener("keydown", handler, { once: true });
            }
          }}
        />
      ) : null}
      <HeroSection />
      <HeroMarquee />
<div className="relative z-10 isolation-isolate mx-auto flex max-w-[1440px] flex-col gap-0 px-6 pb-24 md:pb-28">
  <AboutSection />
  <ProgramsSection />
  <EventsSection />
  <PiratageMarquee />
  <div style={{ marginTop: '1.5rem' }} />
  <MembersSection />
  <GallerySection />
  <GetInvolvedSection />
</div>
    </div>
  );
};

export default Index;