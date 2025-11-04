import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useExperienceSettings } from "@/contexts/ExperienceSettingsContext";
import { cn } from "@/lib/utils";
import {
  Sliders as Equalizer,
  Minus,
  MousePointer2,
  Sparkles,
  Tv,
  Undo2,
  Volume2,
  Waves,
} from "lucide-react";

export type AccessibilityPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const textScaleMarks = [
  { value: 0.9, label: "XS" },
  { value: 1, label: "Base" },
  { value: 1.15, label: "LG" },
  { value: 1.3, label: "XL" },
];

const AccessibilityPanel = ({ open, onOpenChange }: AccessibilityPanelProps) => {
  const { settings, updateSetting, reset } = useExperienceSettings();

  // Lock background scroll and pause Lenis while panel is open
  const pausedLenisRef = useRef(false);
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const html = document.documentElement;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    body.style.overflow = "hidden";

    const lenis = (window as any).__lenis as
      | { stop?: () => void; start?: () => void }
      | undefined;
    if (lenis?.stop) {
      lenis.stop();
      pausedLenisRef.current = true;
    }

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      if (pausedLenisRef.current && lenis?.start) {
        lenis.start();
        pausedLenisRef.current = false;
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="glass-panel w-full max-w-2xl overflow-hidden border border-white/10 p-0 text-foreground"
      >
        <div
          className="relative max-h-[85vh] overflow-y-auto overscroll-contain touch-pan-y"
          style={{ WebkitOverflowScrolling: "touch", maxHeight: "85dvh" }}
          onWheelCapture={(e) => e.stopPropagation()}
          onTouchMoveCapture={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-cyber-grid opacity-60" aria-hidden="true" />
          <div className="relative space-y-10 p-8">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl text-glow">
                Accessibility &amp; Experience Lab
              </DialogTitle>
            </DialogHeader>
            <section aria-labelledby="motion-controls" className="space-y-6">
              <header className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-neon-teal">
                  <MousePointer2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 id="motion-controls" className="font-display text-lg text-foreground">
                    Motion &amp; Parallax
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Disable intense animations and parallax for lower sensory load.
                  </p>
                </div>
              </header>
              <PreferenceRow
                label="Motion Enabled"
                description="Turns on/off parallax, GSAP sequences, and hover dynamics."
              >
                <Switch
                  checked={settings.motionEnabled}
                  onCheckedChange={(checked) => updateSetting("motionEnabled", Boolean(checked))}
                />
              </PreferenceRow>
              <PreferenceRow
                label="WebGL Playground"
                description="Prefer the 3D canvas experience when supported."
              >
                <Switch
                  checked={settings.webglPreferred}
                  onCheckedChange={(checked) => updateSetting("webglPreferred", Boolean(checked))}
                />
              </PreferenceRow>
            </section>

            <section aria-labelledby="visual-access" className="space-y-6">
              <header className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-accent">
                  <Equalizer className="h-5 w-5" />
                </span>
                <div>
                  <h3 id="visual-access" className="font-display text-lg text-foreground">
                    Visual Contrast
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tune contrast, scanlines, and CRT textures to your preference.
                  </p>
                </div>
              </header>
              <PreferenceRow
                label="High Contrast"
                description="Boost contrast for better readability and stronger highlights."
              >
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting("highContrast", Boolean(checked))}
                />
              </PreferenceRow>
              <PreferenceRow
                label="CRT Scanlines"
                description="Adds animated scanlines to panels for a retro security-lab feel."
              >
                <Switch
                  checked={settings.crtEnabled}
                  onCheckedChange={(checked) => updateSetting("crtEnabled", Boolean(checked))}
                />
              </PreferenceRow>
              <PreferenceRow
                label="Ambient Grain"
                description="Organic film grain overlay. Toggle off for ultra-clean visuals."
              >
                <Switch
                  checked={settings.grainEnabled}
                  onCheckedChange={(checked) => updateSetting("grainEnabled", Boolean(checked))}
                />
              </PreferenceRow>
            </section>

            <section aria-labelledby="interface-scale" className="space-y-6">
              <header className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-neon-purple">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h3 id="interface-scale" className="font-display text-lg text-foreground">
                    Interface Scale
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Adjust typography size across the entire experience.
                  </p>
                </div>
              </header>
              <div className="space-y-3">
                <Label htmlFor="text-scale" className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Text Size
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-medium text-muted-foreground">
                    {Math.round(settings.textScale * 100)}%
                  </span>
                </Label>
                <Slider
                  id="text-scale"
                  value={[settings.textScale]}
                  min={0.9}
                  max={1.3}
                  step={0.05}
                  onValueChange={([value]) => updateSetting("textScale", value)}
                />
                <div className="flex justify-between text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  {textScaleMarks.map((mark) => (
                    <button
                      key={mark.value}
                      className={cn(
                        "rounded-full border border-transparent px-2 py-1 transition-colors",
                        Math.abs(settings.textScale - mark.value) < 0.01
                          ? "border-primary bg-primary/20 text-primary"
                          : "text-muted-foreground/80 hover:text-primary",
                      )}
                      onClick={() => updateSetting("textScale", mark.value)}
                      type="button"
                    >
                      {mark.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section aria-labelledby="audio-controls" className="space-y-6">
              <header className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-neon-teal">
                  <Volume2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 id="audio-controls" className="font-display text-lg text-foreground">
                    Audio &amp; Feedback
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Light sonic feedback on interactions. Optional, off by default.
                  </p>
                </div>
              </header>
              <PreferenceRow
                label="Enable Micro-sounds"
                description="Play soft bleeps on hovers and confirmations."
              >
                <Switch
                  checked={settings.audioEnabled}
                  onCheckedChange={(checked) => updateSetting("audioEnabled", Boolean(checked))}
                />
              </PreferenceRow>
              <PreferenceRow
                label="Startup Sound"
                description="Play a short chime when the site finishes loading. Off by default."
              >
                <Switch
                  checked={settings.startupSoundEnabled}
                  onCheckedChange={(checked) =>
                    updateSetting("startupSoundEnabled", Boolean(checked))
                  }
                />
              </PreferenceRow>
            </section>

            {/* Theme Mode section removed per request */}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Waves className="h-4 w-4 text-neon-teal" /> Profile saved locally
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4"
                onClick={reset}
              >
                <Undo2 className="h-4 w-4" /> Reset
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/80">
              Settings respect system-level preferences (like reduced motion) and
              store locally on this device. We never transmit them.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

type PreferenceRowProps = {
  label: string;
  description: string;
  children: React.ReactNode;
};

const PreferenceRow = ({ label, description, children }: PreferenceRowProps) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground/80">{description}</p>
    </div>
    <div className="flex items-center justify-end gap-3">{children}</div>
  </div>
);

export default AccessibilityPanel;
