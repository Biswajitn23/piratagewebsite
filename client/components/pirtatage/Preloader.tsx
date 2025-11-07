import { useEffect, useRef, useState } from "react";
import { useExperienceSettings } from "@/contexts/ExperienceSettingsContext";

export type PreloaderProps = {
  onFinish: () => void;
};

const DURATION = 1800; // slightly shorter, smoother welcome

const Preloader = ({ onFinish }: PreloaderProps) => {
  const [percent, setPercent] = useState(0);
  const [visible, setVisible] = useState(true);
  const raf = useRef<number | null>(null);
  const startAt = useRef<number | null>(null);

  const { settings } = useExperienceSettings();

  useEffect(() => {
    // Create a WebAudio context and a continuous oscillator whose pitch
    // and amplitude are subtly modulated by the visual progress. This gives
    // a loading sound that tracks the progress bar.
    let ctx: AudioContext | null = null;
    let osc: OscillatorNode | null = null;
    let gainNode: GainNode | null = null;
    let lfo: OscillatorNode | null = null;

    const createAudio = () => {
      // Respect user preference: if startup sound is disabled, don't create audio
      if (!settings.startupSoundEnabled) return;
      try {
        const Ctor: any = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!Ctor) return;
        ctx = new Ctor();

        gainNode = ctx.createGain();
        // start muted, we'll ramp up quickly when available
        gainNode.gain.value = 0.0001;
        gainNode.connect(ctx.destination);

        osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 220;
        osc.connect(gainNode);

        // subtle LFO to breathe the pad
        lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = "sine";
        lfo.frequency.value = 0.18;
        lfoGain.gain.value = 6; // modulates frequency by a few Hz
        lfo.connect(lfoGain);
        lfoGain.connect((osc.frequency as unknown) as AudioParam);

        osc.start();
        lfo.start();

        // small ramp to audible level
        gainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.03);

        // Ensure context is resumed on user interaction if autoplay is blocked
        if (ctx.state === "suspended") {
          const resumeOnce = async () => {
            try {
              await ctx!.resume();
            } catch {}
            window.removeEventListener("pointerdown", resumeOnce);
            window.removeEventListener("keydown", resumeOnce);
          };
          window.addEventListener("pointerdown", resumeOnce, { once: true });
          window.addEventListener("keydown", resumeOnce, { once: true });
        }
      } catch (e) {
        ctx = null;
      }
    };

    createAudio();

    const tick = (now: number) => {
      if (!startAt.current) startAt.current = now;
      const elapsed = now - (startAt.current || 0);
      const t = Math.min(1, elapsed / DURATION);
      // smooth ease out for visual progress
      const eased = 1 - Math.pow(1 - t, 2);
      const next = Math.min(100, Math.round(eased * 100));
      setPercent(next);

      // sync audio: map percent to frequency (low -> higher) and slightly raise gain on increments
      try {
        if (ctx && osc && gainNode) {
          const targetFreq = 180 + next * 6; // 180Hz -> ~780Hz
          // smooth frequency change
          try {
            (osc.frequency as any).linearRampToValueAtTime(targetFreq, ctx.currentTime + 0.06);
          } catch {}
          // quick transient on progress step
          const transient = 0.006 + next / 1000;
          try {
            gainNode.gain.cancelScheduledValues(ctx.currentTime);
            gainNode.gain.setValueAtTime(Math.max(0.002, gainNode.gain.value), ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.045, ctx.currentTime + transient);
            gainNode.gain.exponentialRampToValueAtTime(0.02, ctx.currentTime + transient + 0.08);
          } catch {}
        }
      } catch {}

      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        // fade out audio and finish
        try {
          if (ctx && gainNode) {
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
          }
        } catch {}
        setTimeout(() => {
          try {
            if (osc) osc.stop();
            if (lfo) lfo.stop();
            if (ctx) ctx.close();
          } catch {}
          setVisible(false);
          onFinish();
        }, 260);
      }
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      try {
        if (osc) osc.stop();
        if (lfo) lfo.stop();
        if (ctx) ctx.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gradient-to-b from-[#030217] via-[#04021a] to-[#060218] text-foreground">
      <div className="w-full max-w-2xl px-6">
        <div className="mx-auto flex w-full flex-col items-center gap-6 text-center">
          <div className="rounded-full bg-gradient-to-br from-[#07292a] to-[#021026] p-1 shadow-lg">
            <img
              src="/piratagelogo.ico"
              alt="Piratage"
              className="h-28 w-28 rounded-full object-cover ring-2 ring-neon-teal/30"
            />
          </div>

          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-glow">Piratage</h1>
            <p className="mt-1 text-sm text-muted-foreground">Hacker community • Workshops • CTFs</p>
          </div>

          <div className="w-full px-6">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/6 ring-1 ring-white/6">
              <div
                aria-hidden
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 transition-all duration-150 ease-linear"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{percent}%</span>
              <button
                type="button"
                className="text-xs text-primary underline-offset-2 hover:underline"
                onClick={() => {
                  if (raf.current) cancelAnimationFrame(raf.current);
                  setVisible(false);
                  onFinish();
                }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
