import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MonitorCog, Radar, ShieldCheck, Skull, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const programIcons = {
  Workshops: MonitorCog,
  "Capture The Flag": Skull,
  "Security Audits": ShieldCheck,
  Outreach: Users,
  Research: Radar,
} as const;

const microScenes: Record<string, string> = {
  Workshops: "https://prod.spline.design/VzG7fmn2ZwWNwhmV/scene.splinecode",
  "Capture The Flag": "https://prod.spline.design/YiL4kRym4X9PrWSq/scene.splinecode",
  "Security Audits": "https://prod.spline.design/TwXN0rv3NxE466a1/scene.splinecode",
  Outreach: "https://prod.spline.design/xnWgFhL38JFoZkIG/scene.splinecode",
  Research: "https://prod.spline.design/VbPjvBtzKxG1BYzv/scene.splinecode",
};

const programs = [
  {
    name: "Workshops",
    blurb: "Hands-on labs covering recon, crypto, exploit dev, and cloud defense.",
    details: "Weekly labs on exploit building, defensive automation, and post-mortem breakdowns with live notes shared via Builder CMS.",
  },
  {
    name: "Capture The Flag",
    blurb: "On-campus and global scrims with scouting and debrief rituals.",
    details: "We operate drill seasons with campus scoreboards, run custom badge hardware, and publish write-ups with code snippets.",
  },
  {
    name: "Security Audits",
    blurb: "Pro-bono audits for campus orgs with responsible disclosure.",
    details: "Partner with student orgs, map threat models, and ship remediation PRs within 72 hours.",
  },
  {
    name: "Outreach",
    blurb: "Gamified security bootcamps for local schools and newcomers.",
    details: "Design phishing simulators, teach safe browsing, run the sandbox micro playground, and distribute Guardian zines.",
  },
  {
    name: "Research",
    blurb: "Purple-team experiments, AI safety probes, and firmware forensics.",
    details: "Publish monthly research logs, collaborate with faculty, and maintain the campus vulnerability map archive.",
  },
] as const;

const ProgramsSection = () => {
  const [selectedProgram, setSelectedProgram] = useState<typeof programs[number] | null>(null);

  const sceneUrl = useMemo(() => {
    if (!selectedProgram) {
      return null;
    }
    return microScenes[selectedProgram.name] ?? null;
  }, [selectedProgram]);

  return (
    <section
      id="programs"
      className="relative mx-auto mt-28 flex max-w-6xl flex-col gap-12 px-6"
      aria-labelledby="programs-title"
    >
      <div className="space-y-4 text-center">
        <h2 id="programs-title" className="font-display text-4xl text-glow">
          What we do (and how)
        </h2>
        <p className="mx-auto max-w-3xl text-base text-muted-foreground">
          Choose your arena. Every program is CMS-powered so leads can publish missions, content, and rosters without touching code.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program, index) => {
          const Icon = programIcons[program.name as keyof typeof programIcons];
          return (
            <motion.article
              key={program.name}
              className="tilt-hover group flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex flex-col gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-neon-teal">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="font-display text-xl text-foreground">{program.name}</h3>
                <p className="text-sm text-muted-foreground">{program.blurb}</p>
              </div>
              <Button
                variant="ghost"
                className="mt-6 justify-start gap-2 text-xs uppercase tracking-[0.24em] text-primary"
                onClick={() => setSelectedProgram(program)}
              >
                Launch micro-scene
              </Button>
            </motion.article>
          );
        })}
      </div>
      <Dialog open={Boolean(selectedProgram)} onOpenChange={(open) => (!open ? setSelectedProgram(null) : undefined)}>
        <DialogContent className="glass-panel max-w-4xl border border-white/10 bg-[#060218]/90 text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {selectedProgram?.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {selectedProgram?.details}
            </DialogDescription>
          </DialogHeader>
          {sceneUrl ? (
            <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black/50">
              <iframe
                src={sceneUrl}
                title={`${selectedProgram?.name} 3D scene`}
                className="h-[420px] w-full"
                allow="autoplay"
              />
              <span className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Interactive • drag to explore
              </span>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-muted-foreground">
              Scene loading… try again in a moment.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProgramsSection;
