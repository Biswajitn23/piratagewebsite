import { useEffect, useRef } from "react";
import { useExperienceSettings } from "@/contexts/ExperienceSettingsContext";

const CANDIDATE_URLS = [
  "/background.mp3",
  "/background-music.mp3",
  "/Gaming Music 2023 _ Best Music Mix __ Best of NoCopyrightSounds [W18j3d5LkOw].mp3",
  "/Epic Cinematic Trailer by Infraction [No Copyright Music] _ Giants League - Infraction - No Copyright Music (youtube).mp3",
];

const BackgroundMusic = () => {
  const { settings } = useExperienceSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resumeHandlerRef = useRef<() => void | null>(null);
  const webAudioRef = useRef<{
    ctx: AudioContext;
    gain: GainNode;
    oscA: OscillatorNode;
    oscB: OscillatorNode;
  } | null>(null);

  useEffect(() => {
    const cleanupWebAudio = () => {
      const w = webAudioRef.current;
      if (w) {
        try {
          w.oscA.stop();
        } catch {}
        try {
          w.oscB.stop();
        } catch {}
        try {
          w.gain.disconnect();
        } catch {}
        try {
          w.ctx.close();
        } catch {}
        webAudioRef.current = null;
      }
    };

    const startWebAudioPad = async (volume = 0.12) => {
      if (webAudioRef.current) return;
      try {
        const Ctor: any = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!Ctor) return;
        const ctx = new Ctor();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        gain.connect(ctx.destination);

        const oscA = ctx.createOscillator();
        const oscB = ctx.createOscillator();
        oscA.type = "sine";
        oscB.type = "sine";
        oscA.frequency.value = 110; // A2 - low pad
        oscB.frequency.value = 220; // A3 - harmonic

        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 0.15; // slow swell
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.06;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);

        oscA.connect(gain);
        oscB.connect(gain);

        oscA.start();
        oscB.start();
        lfo.start();

        // ramp to audible level
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.4);

        webAudioRef.current = { ctx, gain, oscA, oscB } as any;
      } catch (e) {
        console.warn("WebAudio pad start failed", e);
      }
    };

    const stopWebAudioPad = () => {
      const w = webAudioRef.current;
      if (!w) return;
      try {
        w.gain.gain.exponentialRampToValueAtTime(0.0001, w.ctx.currentTime + 0.3);
        setTimeout(cleanupWebAudio, 400);
      } catch {
        cleanupWebAudio();
      }
    };

    // helper: try candidate URLs sequentially and set audioRef to the first that plays
    const tryPlayCandidates = async (urls: string[]) => {
      for (const url of urls) {
        try {
          const a = new Audio(url);
          a.loop = true;
          a.preload = "auto";
          a.crossOrigin = "anonymous";
          a.volume = settings.backgroundMusicVolume ?? 0.35;
          // attempt to play
          await a.play();
          // success
          // pause any previous audio
          try {
            if (audioRef.current && audioRef.current !== a) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          } catch {}
          audioRef.current = a;
          stopWebAudioPad();
          return true;
        } catch (err) {
          // try next URL
        }
      }
      return false;
    };

    const ensurePlayback = async () => {
      if (!settings.backgroundMusicEnabled) {
        try {
          const audios = Array.from(document.querySelectorAll("audio")) as HTMLAudioElement[];
          for (const a of audios) {
            try {
              a.pause();
              a.currentTime = 0;
            } catch {}
          }
        } catch {}
        try {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        } catch {}
        stopWebAudioPad();
        return;
      }

  // First, try a list of candidate audio files from the public/ folder
  const fileWorked = await tryPlayCandidates(CANDIDATE_URLS);
  if (fileWorked) return;

  // If file failed (missing or autoplay-blocked), fall back to WebAudio pad
      // If autoplay was blocked, resume on first interaction and then start pad/file
      try {
        await startWebAudioPad(settings.backgroundMusicVolume ?? 0.12);
      } catch (e) {
        console.warn("Failed to start fallback WebAudio pad", e);
      }

      // Also attach a one-time resume to try the audio file on first user interaction.
      const tryOnInteract = async () => {
        try {
          const a = audioRef.current;
          if (a) await a.play();
          // if file plays, stop pad
          stopWebAudioPad();
        } catch {}
        window.removeEventListener("pointerdown", tryOnInteract);
        window.removeEventListener("keydown", tryOnInteract);
      };

      resumeHandlerRef.current = tryOnInteract;
      window.addEventListener("pointerdown", tryOnInteract, { once: true });
      window.addEventListener("keydown", tryOnInteract, { once: true });
    };

    ensurePlayback();

    return () => {
      // cleanup element and any handlers
      if (resumeHandlerRef.current) {
        window.removeEventListener("pointerdown", resumeHandlerRef.current);
        window.removeEventListener("keydown", resumeHandlerRef.current);
        resumeHandlerRef.current = null;
      }
      stopWebAudioPad();
    };
  }, [settings.backgroundMusicEnabled, settings.backgroundMusicVolume]);

  return null;
};

export default BackgroundMusic;
