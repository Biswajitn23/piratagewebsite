import { useMemo } from "react";
import { Anchor, Binary, ScrollText, Camera } from "lucide-react";

const copyMap = {
  "code-of-conduct": {
    title: "Code of Conduct",
    description:
      "We operate on respect-first curiosity. Full policy is being finalized; contact us if you need immediate details.",
    icon: Camera,
  },
  privacy: {
    title: "Privacy",
    description:
      "We keep student data encrypted. Formal documentation ships soon. Email crew@pirtatage.club for the current brief.",
    icon: ScrollText,
  },
  sponsors: {
    title: "Sponsor Packet",
    description:
      "Sponsoring helps us defend the campus. Request the holographic deck and metrics overview from our partnerships team.",
    icon: Anchor,
  },
} as const;

type LegalPlaceholderProps = {
  type: keyof typeof copyMap;
};

const LegalPlaceholder = ({ type }: LegalPlaceholderProps) => {
  const copy = copyMap[type];
  const Icon = copy?.icon ?? Binary;

  const gradient = useMemo(
    () =>
      "linear-gradient(135deg, rgba(124,77,255,0.25) 0%, rgba(0,255,209,0.22) 50%, rgba(255,204,51,0.18) 100%)",
    [],
  );

  if (!copy) {
    return null;
  }

  return (
    <section className="relative mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div
        className="glass-panel relative flex w-full flex-col gap-6 rounded-3xl border border-white/10 p-12"
        style={{ backgroundImage: gradient }}
      >
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-neon-teal/40 bg-neon-teal/10 text-neon-teal">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </span>
        <div className="space-y-4">
          <h1 className="font-display text-4xl text-glow">{copy.title}</h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            {copy.description}
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
          Need the doc immediately? Email crew@pirtatage.club
        </p>
      </div>
    </section>
  );
};

export default LegalPlaceholder;
