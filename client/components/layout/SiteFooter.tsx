import { useMemo } from "react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ArrowUpRight, ExternalLink, Linkedin, Instagram, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SiteFooterProps = {
  onJoin: () => void;
};

const SiteFooter = ({ onJoin }: SiteFooterProps) => {

  return (
    <footer className="relative mt-32 border-t border-white/10 bg-[#05021a]/80 backdrop-blur-3xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07031f] via-transparent to-transparent opacity-60" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/20 via-black/90 to-cyan-900/20 p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(0,255,209,0.15)]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-foreground tracking-wide">
                    Message from the President
                  </h3>
                  <p className="text-xs text-muted-foreground/60 uppercase tracking-wider">Leadership Vision</p>
                </div>
              </div>
              
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p className="relative pl-4 border-l-2 border-primary/40">
                  Piratage is for those who think beyond limits and act with purpose. We are here to turn curiosity into capability and ambition into achievement. This community is built to help students grow through real learning, real building, and real challenges.
                </p>
                <p className="relative pl-4 border-l-2 border-purple-500/40">
                  At Piratage, we believe leadership starts with taking initiative. If you are ready to learn deeply, build fearlessly, and create impact through technology, this is your space. Together, we are shaping innovators who will define the future.
                </p>
              </div>
              
              <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm">
                <div className="relative h-16 w-16 flex-shrink-0">
                  <OptimizedImage 
                    src="/nitin.jpg" 
                    alt="Nitin Singh" 
                    width={80}
                    height={80}
                    className="h-full w-full rounded-xl border-2 border-primary/50 object-cover shadow-lg shadow-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-black bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg font-semibold text-foreground">
                    Nitin Singh
                  </p>
                  <p className="text-xs text-primary">
                    President, Piratage AUC
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    ● Leading with Vision & Purpose
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-50"></div>
              <div className="relative z-10">
                <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground/60">
                  Institutional Affiliation
                </p>
                <div className="flex items-center gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 blur-xl"></div>
                    <img 
                      src="/logo.webp" 
                      alt="Amity University Logo" 
                      className="relative h-20 w-20 rounded-2xl object-contain bg-white/10 p-2 border border-white/20 shadow-lg"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      Amity University Raipur
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Chhattisgarh
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs text-primary">
                        Student Technical Club
                      </span>
                      <span className="inline-flex items-center rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs text-purple-400">
                        Non-Commercial
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-panel rounded-3xl border border-white/10 p-6">
              <h3 className="font-display text-lg uppercase tracking-[0.3em] text-muted-foreground">
                Connect
              </h3>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
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
                <a
                  href="https://discord.com/invite/9gZKmd8b"
                  className="tilt-hover inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition-colors hover:text-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Discord
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3"
            aria-label="Legal Links"
          >
            <Link to="/code-of-conduct" className={linkClassName} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Code of Conduct
            </Link>
            <Link to="/privacy" className={linkClassName} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Privacy
            </Link>
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
