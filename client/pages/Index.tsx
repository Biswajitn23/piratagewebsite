import { useEffect, useRef, useState } from "react";

import EventsSection from "@/components/pirtatage/EventsSection";
import GallerySection from "@/components/pirtatage/GallerySection";
import GetInvolvedSection from "@/components/pirtatage/GetInvolvedSection";
import HeroSection from "@/components/pirtatage/HeroSection";
import MembersSection from "@/components/pirtatage/MembersSection";
import MissionSection from "@/components/pirtatage/MissionSection";
import Preloader from "@/components/pirtatage/Preloader";
import BackgroundMusic from "@/components/BackgroundMusic";
import ProgramsSection from "@/components/pirtatage/ProgramsSection";
import ProjectsSection from "@/components/pirtatage/ProjectsSection";

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
                  const Ctor = window.AudioContext || window.webkitAudioContext;
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
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-0 md:gap-0 px-6 pb-24 md:pb-28 pt-0 lg:pt-0">
        <MissionSection />
        <ProgramsSection />
        <EventsSection />
        
        <MembersSection />
        {/* <ProjectsSection /> */}
        <GallerySection />
        <GetInvolvedSection />
      </div>
    </div>
  );
};

export default Index;