
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ArrowUpRight, ExternalLink, Linkedin, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const linkClassName = cn(
  "tilt-hover inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-muted-foreground transition-colors hover:text-primary",
);

export type SiteFooterProps = {
  onJoin: () => void;
};

const SiteFooter = ({ onJoin }: SiteFooterProps) => {
  return (
    <footer className="w-full px-4 pt-12 pb-8 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0a0a0f 25%, #0f0a1a 40%, #1a0f2e 55%, #2d1b4e 70%, #4b0082 80%, #6a1b9a 90%, #8a2be2 100%)'}}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Institutional Affiliation and Connect */}
        <div className="space-y-8">
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
          <div className="glass-panel rounded-3xl border border-white/10 p-6 mt-4">
            <h3 className="font-display text-lg uppercase tracking-[0.3em] text-muted-foreground">
              Connect
            </h3>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <a
                href="mailto:piratage.auc@gmail.com"
                className={linkClassName}
              >
                piratage.auc@gmail.com <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.instagram.com/piratage_club_auc/"
                className={linkClassName}
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
              <a
                href="https://www.linkedin.com/in/piratage-the-ethical-hacking-club-5a736a354/"
                className={linkClassName}
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
              <a
                href="https://discord.gg/BYcgdwHPYu"
                className={linkClassName}
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
        {/* Navigation Links */}
        <div className="mt-8">
          <ul className="space-y-2 text-gray-400">
            <li><a href="/about" className="hover:text-purple-400">About Us</a></li>
            <li><a href="/events" className="hover:text-purple-400">Upcoming Events</a></li>
            <li><a href="/team" className="hover:text-purple-400">Join the Team</a></li>
            <li><a href="/gallery" className="hover:text-purple-400">Gallery</a></li>
          </ul>
          <p className="mt-8 text-sm text-gray-500">
            Built with <span className="text-pink-500">❤️</span> by the <span className="text-white">Piratage Dev Team</span>.
          </p>
        </div>
      </div>
      {/* Footer Bottom Bar */}
      <div className="flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between mt-8">
        <div className="flex flex-wrap items-center gap-3" aria-label="Legal Links">
          <Link to="/code-of-conduct" className={linkClassName} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Code of Conduct
          </Link>
          <Link to="/privacy" className={linkClassName} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Privacy
          </Link>
        </div>
        <div className="flex flex-col gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground/70 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Piratage : The Ethical Hacking Club</span>
          <span>Campus safe. Curiosity amplified.</span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
