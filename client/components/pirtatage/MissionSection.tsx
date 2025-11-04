import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Sparkles, UserCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const MissionSection = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pledgeOpen, setPledgeOpen] = useState(false);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".mission-card").forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.1,
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
            },
          },
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="mission"
      ref={rootRef}
      className="relative mx-auto mt-16 lg:mt-24 flex max-w-6xl flex-col gap-10 px-6"
      aria-labelledby="mission-title"
    >
      <div className="space-y-4 text-center">
        <Badge variant="secondary" className="mx-auto rounded-full border border-white/20 bg-white/15 px-6 py-2 text-xs uppercase tracking-[0.3em]">
          Mission Brief
        </Badge>
        <h2 id="mission-title" className="font-display text-4xl text-glow">
          Curiosity with a security oath
        </h2>
        <p className="mx-auto max-w-3xl text-base text-muted-foreground">
          We’re the campus defense guild: red team hearts, blue team discipline. We pick locks so students stay safe,
          and every exploit we find turns into a patched story for the university.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <article className="mission-card relative flex flex-col gap-4 rounded-3xl border border-white/15 bg-white/8 p-8 shadow-glass backdrop-blur-xl">
          <Shield className="h-8 w-8 text-neon-teal" aria-hidden="true" />
          <h3 className="font-display text-xl text-foreground">Ethical by Design</h3>
          <p className="text-sm text-muted-foreground">
            Every member signs the Guardian Charter: report responsibly, uplift campus teams, disclose transparently.
          </p>
          <button
            type="button"
            className="mt-auto inline-flex w-max items-center gap-2 text-xs uppercase tracking-[0.24em] text-primary hover:underline"
            onClick={() => setPledgeOpen((prev) => !prev)}
            aria-expanded={pledgeOpen}
          >
            {pledgeOpen ? "Hide ethics pledge" : "View ethics pledge"}
          </button>
          {pledgeOpen ? (
            <div className="mt-3 rounded-2xl border border-neon-teal/40 bg-neon-teal/10 p-4 text-xs text-foreground">
              <p>
                1. Consent-first hacking. 2. Document findings with reproducible evidence. 3. Patch notes before bragging rights. 4. Mentor the next defender.
              </p>
            </div>
          ) : null}
        </article>
        <article className="mission-card relative flex flex-col gap-4 rounded-3xl border border-white/15 bg-white/8 p-8 shadow-glass backdrop-blur-xl">
          <Sparkles className="h-8 w-8 text-neon-purple" aria-hidden="true" />
          <h3 className="font-display text-xl text-foreground">Founder Signal</h3>
          <p className="text-sm text-muted-foreground">
            Started by dorm-mates who patched an exposed campus door lock system. Their ethos: curiosity that protects, crafts, and publishes.
          </p>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">“Guardianship is a team sport.”</p>
        </article>
        <article className="mission-card relative flex flex-col gap-4 rounded-3xl border border-white/15 bg-white/8 p-8 shadow-glass backdrop-blur-xl">
          <UserCheck className="h-8 w-8 text-accent" aria-hidden="true" />
          <h3 className="font-display text-xl text-foreground">Mentor Pods</h3>
          <p className="text-sm text-muted-foreground">
            Weekly pods blend red vs. blue drills, shared write-ups, and cross-discipline research. Everyone teaches. Everyone learns.
          </p>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">pods: Recon, Malware, AI Safety, IR</p>
        </article>
      </div>
    </section>
  );
};

export default MissionSection;
