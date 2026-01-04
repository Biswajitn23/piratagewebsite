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
    // Kill any existing AudioContext instances immediately
    try {
      // @ts-ignore - Access global audio contexts if they exist
      if (window.audioContexts) {
        window.audioContexts.forEach((ctx: any) => {
          try { ctx.close(); } catch {}
        });
      }
    } catch {}

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

    // Immediately cleanup any existing WebAudio on mount
    cleanupWebAudio();

    const startWebAudioPad = async (volume = 0.12) => {
      // Disabled: WebAudio fallback creates unwanted noise
      // If background.mp3 is missing, simply don't play anything
      return;
      /* Original oscillator code commented out to prevent noise
      if (webAudioRef.current) return;
      try {
        const Ctor = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctor) return;
        // Only create AudioContext after user gesture
        if (Ctor.prototype.state === 'suspended') return;
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
      */
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
        // Only create AudioContext after user gesture
        const tryOnInteract = async () => {
          try {
            const Ctor = window.AudioContext || (window as any).webkitAudioContext;
            if (!Ctor) return;
            const ctx = new Ctor();
            if (ctx.state === 'suspended') await ctx.resume();
            await startWebAudioPad(settings.backgroundMusicVolume ?? 0.12);
            window.removeEventListener("pointerdown", tryOnInteract);
            window.removeEventListener("keydown", tryOnInteract);
            stopWebAudioPad();
          } catch (e) {
            console.warn("Failed to start fallback WebAudio pad", e);
          }
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
