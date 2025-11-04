import { useEffect, useMemo, useRef, useState } from "react";

export type PreloaderProps = {
  onFinish: () => void;
};

const STATUS_LINES = [
  "INITIALIZING BOOTLOADER",
  "PROBING NETWORK LAYER",
  "DECRYPTING SIGNATURES",
  "MOUNTING FIREWALLS",
  "FINALIZING PROTOCOLS",
];

// Increase total animation duration for more dramatic hacking splash
const DURATION = 4200; // total animation duration in ms

const Preloader = ({ onFinish }: PreloaderProps) => {
  const [percent, setPercent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [statusIndex, setStatusIndex] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const statusLines = useMemo(() => STATUS_LINES, []);

  useEffect(() => {
    let lastTick = 0;
    // WebAudio context for beeps
    let audioCtx: AudioContext | null = null;
    let startOsc: OscillatorNode | null = null;
    let endOsc: OscillatorNode | null = null;

    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // start beep
      startOsc = audioCtx.createOscillator();
      const startGain = audioCtx.createGain();
      startOsc.type = "sawtooth";
      startOsc.frequency.value = 440;
      startGain.gain.value = 0.0001;
      startOsc.connect(startGain);
      startGain.connect(audioCtx.destination);
      startOsc.start();
      // ramp up then fade
      startGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.02);
      startGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
      setTimeout(() => {
        try { startOsc && startOsc.stop(); } catch {}
      }, 220);
    } catch (err) {
      // ignore audio errors
      audioCtx = null;
    }

    function step(now: number) {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - (startRef.current || 0);
      const t = Math.min(1, elapsed / DURATION);

      // eased progress for a more 'hacking' feel
      const eased = 1 - Math.pow(1 - t, 3);
      // add small randomness early on to feel dynamic
      const jitter = t < 0.85 ? Math.floor(Math.random() * 3) : 0;
      const next = Math.min(100, Math.floor(eased * 100) + jitter);

      // only update state occasionally to avoid too many renders
      if (now - lastTick > 30) {
        setPercent(next);
        lastTick = now;
      }

      // rotate status lines periodically
      if (elapsed > (statusIndex + 1) * (DURATION / Math.max(1, statusLines.length))) {
        setStatusIndex((i) => Math.min(statusLines.length - 1, i + 1));
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setPercent(100);
        // small delay for UX before closing
        setTimeout(() => {
          // completion beep
          try {
            if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            endOsc = audioCtx.createOscillator();
            const endGain = audioCtx.createGain();
            endOsc.type = "triangle";
            endOsc.frequency.value = 880;
            endGain.gain.value = 0.0001;
            endOsc.connect(endGain);
            endGain.connect(audioCtx.destination);
            endOsc.start();
            endGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.02);
            endGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.28);
            setTimeout(() => {
              try { endOsc && endOsc.stop(); } catch {}
            }, 320);
          } catch (e) {
            // ignore
          }

          setVisible(false);
          onFinish();
        }, 300);
      }
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFinish, statusLines.length]);

  if (!visible) return null;

  return (
    <div
      id="preloader"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#030111] text-foreground"
      role="status"
      aria-live="polite"
    >
      {/* matrix-like moving background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[length:200%_200%] bg-gradient-to-br from-[#001217] via-[#021026] to-[#0b0710] animate-[marquee_18s_linear_infinite] opacity-40" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,#002a1a_0px,#002a1a_2px,transparent_2px,transparent_6px)] opacity-10 mix-blend-overlay" />
      </div>

      <div className="w-full max-w-xl px-6">
        <div className="mx-auto flex w-full flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/piratagelogo.ico" alt="Piratage logo" className="h-10 w-10 rounded-full object-cover ring-1 ring-neon-teal/30 shadow-[0_0_24px_rgba(58,255,200,0.06)]" />
              <div>
                <div className="text-xs font-mono uppercase text-neon-teal/90">Piratage Bootloader</div>
                <div className="text-[10px] font-mono text-muted-foreground">Secure initialization</div>
              </div>
            </div>
            <div className="text-xs font-mono text-muted-foreground">{percent}%</div>
          </div>

          <div className="relative h-5 w-full overflow-hidden rounded-md bg-[#0b0b10]/60 ring-1 ring-white/2">
            {/* main fill */}
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-neon-teal via-neon-purple to-neon-teal blur-sm"
              style={{ width: `${percent}%`, transition: 'width 140ms linear' }}
              aria-hidden
            />

            {/* subtle glitch overlay */}
            <div className="absolute left-0 top-0 h-full w-full pointer-events-none">
              <div
                className="absolute left-0 top-0 h-full bg-neon-teal/10 mix-blend-screen"
                style={{ width: `${Math.max(0, percent - 6)}%`, transform: 'translateX(4px)', opacity: 0.6 }}
              />
              <div
                className="absolute left-0 top-0 h-full bg-neon-purple/8 mix-blend-screen"
                style={{ width: `${Math.max(0, percent - 12)}%`, transform: 'translateX(-3px)', opacity: 0.5 }}
              />
            </div>

            {/* centered typing status */}
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono text-neon-teal/80">
              <TypingStatus text={statusLines[statusIndex]} progress={percent} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-muted-foreground">Initializing security protocols…</div>
            <button
              type="button"
              className="text-xs font-mono uppercase text-primary underline-offset-4 hover:underline"
              onClick={() => {
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
  );
};

// Simple typing reveal component for status lines
const TypingStatus = ({ text, progress }: { text: string; progress: number }) => {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    setDisplay("");
    let i = 0;
    const speed = 18; // ms per character
    const interval = setInterval(() => {
      setDisplay((prev) => prev + text.charAt(i));
      i += 1;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, progress]);

  return (
    <span className="font-mono text-[11px] text-neon-teal/80">
      <span className="border-r-2 border-neon-teal/60 pr-1 animate-pulse">{display}</span>
    </span>
  );
};

export default Preloader;
