import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ExternalLink, Linkedin, Instagram } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SiteFooterProps = {
  onJoin: () => void;
};

const sponsorLogos = [
  { name: "ShieldWorks", url: "#", label: "ShieldWorks" },
  { name: "CyberLabs", url: "#", label: "CyberLabs" },
  { name: "TrustGuard", url: "#", label: "TrustGuard" },
];

const SiteFooter = ({ onJoin }: SiteFooterProps) => {

  return (
    <footer className="relative mt-32 border-t border-white/10 bg-[#05021a]/80 backdrop-blur-3xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07031f] via-transparent to-transparent opacity-60" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-panel rounded-3xl border border-white/10 p-10 shadow-glass">
            <h2 className="font-display text-3xl font-semibold text-glow">
              Ready to defend the campus?
            </h2>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
              Piratage blends curiosity and responsibility. Join the crew to get
              early invites to workshops, CTFs, and our security audit squads. We
              keep it ethical, we keep it playful, and we never stop learning.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="tilt-hover rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-8 py-6 text-base font-semibold text-primary-foreground shadow-glow"
                onClick={onJoin}
              >
                Join the Crew
              </Button>
              <Button
                variant="ghost"
                className="tilt-hover rounded-full border border-white/20 bg-white/5 px-6 py-6 text-base font-semibold text-foreground"
                asChild
              >
                <Link to="/#get-involved" className="flex items-center gap-2">
                  Opportunities <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-8">
            <div className="glass-panel rounded-3xl border border-white/10 p-8">
              <h3 className="font-display text-lg uppercase tracking-[0.3em] text-muted-foreground">
                Connect
              </h3>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <a
                  href="mailto:piratage.auc@gmail.com"
                  className="tilt-hover inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition-colors hover:text-primary"
                >
                  piratage.auc@gmail.com <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://www.instagram.com/piratage_club_auc/"
                  className="tilt-hover inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition-colors hover:text-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
                <a
                  href="https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/"
                  className="tilt-hover inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition-colors hover:text-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3"
            aria-label="Legal Links"
          >
            <Link to="/code-of-conduct" className={linkClassName}>
              Code of Conduct
            </Link>
            <Link to="/privacy" className={linkClassName}>
              Privacy
            </Link>
            <Link to="/sponsors" className={linkClassName}>
              Sponsors
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {sponsorLogos.map((logo) => (
              <span
                key={logo.name}
                className="tilt-hover inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground"
                aria-label={`Sponsor ${logo.label}`}
              >
                {logo.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground/70 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Piratage : The Ethical Hacking Club</span>
          <span>Campus safe. Curiosity amplified.</span>
        </div>
      </div>
    </footer>
  );
};

const linkClassName = cn(
  "tilt-hover inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-muted-foreground transition-colors hover:text-primary",
);

export default SiteFooter;
