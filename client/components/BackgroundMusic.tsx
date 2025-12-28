import { useEffect, useRef } from "react";
import { useExperienceSettings } from "@/contexts/ExperienceSettingsContext";

const BACKGROUND_MUSIC_URL = "/background.mp3";

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
    // Only change volume of currently playing audio, do not restart
    if (audioRef.current) {
      audioRef.current.volume = settings.backgroundMusicVolume ?? 0.35;
    }
    // For WebAudio fallback, update gain if playing
    if (webAudioRef.current) {
      try {
        webAudioRef.current.gain.gain.linearRampToValueAtTime(
          settings.backgroundMusicVolume ?? 0.12,
          webAudioRef.current.ctx.currentTime + 0.2
        );
      } catch {}
    }
  }, [settings.backgroundMusicVolume]);

  useEffect(() => {
    // Only use /background.mp3 for playback
    const cleanupWebAudio = () => {
      const w = webAudioRef.current;
      if (w) {
        try { w.oscA.stop(); } catch {}
        try { w.oscB.stop(); } catch {}
        try { w.gain.disconnect(); } catch {}
        try { w.ctx.close(); } catch {}
        webAudioRef.current = null;
      }
    };

    const startWebAudioPad = async (volume = 0.12) => {
      if (webAudioRef.current) return;
      try {
        const Ctor = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctor) return;
        const ctx = new Ctor();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        gain.connect(ctx.destination);
        const oscA = ctx.createOscillator();
        const oscB = ctx.createOscillator();
        oscA.type = "sine";
        oscB.type = "sine";
        oscA.frequency.value = 110;
        oscB.frequency.value = 220;
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 0.15;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.06;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        oscA.connect(gain);
        oscB.connect(gain);
        oscA.start();
        oscB.start();
        lfo.start();
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.4);
        webAudioRef.current = { ctx, gain, oscA, oscB };
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

    const ensurePlayback = async () => {
      if (!settings.backgroundMusicEnabled) {
        try {
          const audios = Array.from(document.querySelectorAll("audio")) as HTMLAudioElement[];
          for (const a of audios) {
            try { a.pause(); a.currentTime = 0; } catch {}
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

      // Only use /background.mp3
      try {
        const a = new Audio(BACKGROUND_MUSIC_URL);
        a.loop = true;
        a.preload = "auto";
        a.crossOrigin = "anonymous";
        a.volume = settings.backgroundMusicVolume ?? 0.35;
        await a.play();
        try {
          if (audioRef.current && audioRef.current !== a) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        } catch {}
        audioRef.current = a;
        stopWebAudioPad();
        return;
      } catch (err) {
        // If file failed (missing or autoplay-blocked), fall back to WebAudio pad
        try {
          await startWebAudioPad(settings.backgroundMusicVolume ?? 0.12);
        } catch (e) {
          console.warn("Failed to start fallback WebAudio pad", e);
        }

        // Attach a one-time resume to try the audio file on first user interaction.
        const tryOnInteract = async () => {
          try {
            const a = audioRef.current;
            if (a) await a.play();
            stopWebAudioPad();
          } catch {}
          window.removeEventListener("pointerdown", tryOnInteract);
          window.removeEventListener("keydown", tryOnInteract);
        };
        resumeHandlerRef.current = tryOnInteract;
        window.addEventListener("pointerdown", tryOnInteract, { once: true });
        window.addEventListener("keydown", tryOnInteract, { once: true });
      }
    };

    ensurePlayback();

    return () => {
      if (resumeHandlerRef.current) {
        window.removeEventListener("pointerdown", resumeHandlerRef.current);
        window.removeEventListener("keydown", resumeHandlerRef.current);
        resumeHandlerRef.current = null;
      }
      stopWebAudioPad();
    };
  }, [settings.backgroundMusicEnabled]);

  return null;
};

export default BackgroundMusic;
