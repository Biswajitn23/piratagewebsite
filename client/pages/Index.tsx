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
            // Defer to next tick to ensure main audio context is allowed
            requestAnimationFrame(async () => {
              if (playedRef.current || !settings.startupSoundEnabled) return;
              try {
                const SOUND_URL = "/startup-sound.mp3";

                const playAudioFile = async () => {
                  return new Promise<void>((resolve, reject) => {
                    const audio = new Audio(SOUND_URL);
                    audio.volume = 0.6;
                    const cleanup = () => {
                      audio.onended = null;
                      audio.onerror = null;
                    };
                    audio.onended = () => {
                      cleanup();
                      resolve();
                    };
                    audio.onerror = () => {
                      cleanup();
                      reject(new Error("audio-error"));
                    };
                    audio.play().then(() => {
                      playedRef.current = true;
                    }).catch(() => {
                      // Autoplay likely blocked; retry on first user interaction
                      const onFirstInteract = async () => {
                        try {
                          await audio.play();
                          playedRef.current = true;
                          cleanup();
                          resolve();
                        } catch {
                          cleanup();
                          reject(new Error("autoplay-blocked"));
                        } finally {
                          window.removeEventListener("pointerdown", onFirstInteract);
                          window.removeEventListener("keydown", onFirstInteract);
                        }
                      };
                      window.addEventListener("pointerdown", onFirstInteract, { once: true });
                      window.addEventListener("keydown", onFirstInteract, { once: true });
                    });
                  });
                };

                const playChime = async () => {
                  // Web Audio API: simple chime (two short sine notes)
                  const Ctor: any = (window as any).AudioContext || (window as any).webkitAudioContext;
                  if (!Ctor) return;
                  const ctx = new Ctor();
                  const startBase = ctx.currentTime + 0.02;
                  const makeTone = (freq: number, start: number, dur: number, gain = 0.08) => {
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

                  const schedule = async () => {
                    const now = ctx.currentTime < startBase ? startBase : ctx.currentTime + 0.01;
                    makeTone(587.33, now, 0.12); // D5
                    makeTone(784.0, now + 0.12, 0.16); // G5
                    playedRef.current = true;
                  };

                  if (ctx.state === "suspended") {
                    const onFirstInteract = async () => {
                      try { await ctx.resume(); } catch {}
                      await schedule();
                      window.removeEventListener("pointerdown", onFirstInteract);
                      window.removeEventListener("keydown", onFirstInteract);
                    };
                    window.addEventListener("pointerdown", onFirstInteract, { once: true });
                    window.addEventListener("keydown", onFirstInteract, { once: true });
                  } else {
                    await schedule();
                  }
                };

                // Try to play provided audio file first, fallback to chime
                try {
                  await playAudioFile();
                } catch {
                  await playChime();
                }
              } catch (_) {
                // ignore; audio may be blocked until user interaction
              }
            });
          }}
        />
      ) : null}
      <HeroSection />
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-20 md:gap-24 px-6 pb-24 md:pb-28 pt-28 lg:pt-32">
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