import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Accessibility, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { cn } from "@/lib/utils";
import { useExperienceSettings } from "@/contexts/ExperienceSettingsContext";

const NAV_ITEMS = [
  { label: "Overview", hash: "overview" },
  { label: "About", hash: "about" },
  { label: "Events", hash: "events" },
  { label: "Get Involved", hash: "get-involved" },
];

export type SiteHeaderProps = {
  onJoin: () => void;
  onAccessibility: () => void;
};

const SiteHeader = ({ onJoin, onAccessibility }: SiteHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, updateSetting } = useExperienceSettings();
  const [pointerPosition, setPointerPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 50, y: 50 });
  const [activeHash, setActiveHash] = useState<string>(() =>
    location.hash ? location.hash.replace("#", "") : "overview",
  );
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointer = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      setPointerPosition({ x, y });
    },
    [],
  );

  // Track section in view for active nav state
  useEffect(() => {
    const ids = NAV_ITEMS.map((i) => i.hash);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!elements.length || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHash(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0% -55% 0%", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  // Observe global hide flag
  useEffect(() => {
    const node = document.documentElement;
    const update = () =>
      setHidden(node.getAttribute("data-hide-header") === "true");
    update();
    const obs = new MutationObserver(update);
    obs.observe(node, {
      attributes: true,
      attributeFilter: ["data-hide-header"],
    });
    return () => obs.disconnect();
  }, []);

  // Compact header after hero section (transparent over hero, opaque after)
  useEffect(() => {
    const hero = typeof document !== "undefined" ? document.getElementById("overview") : null;
    if (hero && typeof IntersectionObserver !== "undefined") {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Compact (opaque) when the hero is no longer intersecting
            setCompact(!entry.isIntersecting);
          });
        },
        { rootMargin: "-1px 0px -99% 0px", threshold: 0 }, // triggers as soon as hero is out of view
      );
      obs.observe(hero);
      return () => obs.disconnect();
    }

    // Fallback to simple scroll threshold
    const onScroll = () => {
      // Use hero height if available, else fallback
      const heroEl = document.getElementById("overview");
      const heroHeight = heroEl ? heroEl.offsetHeight : 400;
      setCompact(window.scrollY > heroHeight - 60);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavigate = useCallback(
    (hash: string) => {
      const sanitized = hash.startsWith("#") ? hash : `#${hash}`;
      if (location.pathname !== "/") {
        navigate(`/${sanitized}`);
        return;
      }
      if (window.location.hash !== sanitized) {
        window.history.replaceState(null, "", sanitized);
      }
      const element = document.getElementById(hash.replace("#", ""));
      if (element)
        element.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [location.pathname, navigate],
  );


  const renderNavLinks = (variant: "desktop" | "mobile") => (
    <nav aria-label="Primary">
      <ul
        className={cn(
          "flex flex-wrap items-center gap-5",
          variant === "mobile" && "flex-col items-start gap-6 text-lg",
        )}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeHash === item.hash;
          return (
            <li key={item.hash} className="list-none">
              <button
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative text-sm font-semibold uppercase tracking-[0.18em] text-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none",
                  "after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-[#ad5389] after:via-[#8f3c8a] after:to-[#3c1053] after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100",
                  isActive && "text-foreground after:scale-x-100",
                  variant === "mobile" && "text-base",
                )}
                onClick={() => handleNavigate(item.hash)}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const handleThemeToggle = () => {};

  return (
    <header
      ref={containerRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[padding,transform,background-color,border-color,backdrop-filter] will-change-transform",
        // Mobile: transparent while over the hero (not compact), opaque when compact
        compact
          ? "border-b bg-[#0a0a0f]/75 backdrop-blur-xl border-white/10"
          : "bg-transparent border-transparent backdrop-blur-none",
        // Desktop: keep transparent at the top when not compact
        !compact && "lg:bg-transparent lg:backdrop-blur-none lg:border-transparent",
        // Padding adjustment on scroll
        compact ? "py-1" : "py-0",
        // Hiding logic
        hidden && "-translate-y-full",
      )}
      onMouseMove={handlePointer}
    >
      
      <div
        className="pointer-events-none absolute inset-0 opacity-30 transition-opacity duration-500"
        style={{
          background: `radial-gradient(140% 140% at ${pointerPosition.x}% ${pointerPosition.y}%, rgba(255, 255, 255, 0.06), rgba(173, 83, 137, 0.05) 55%, transparent 100%)`,
        }}
      />
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 sm:px-8",
          compact ? "py-1 sm:py-2" : "py-3 sm:py-4",
        )}
      >
        <div className={cn("flex items-center", compact ? "gap-3" : "gap-5")}>
          <Link
            to="/"
            aria-label="Piratage home"
            className={cn(
              "group relative flex items-center gap-0 rounded-full transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              compact && "scale-90"
            )}
          >
            <OptimizedImage
              src="/piratagelogo.webp"
              alt="Piratage logo"
              width={140}
              height={140}
              priority
              className={cn(
                "rounded-full object-cover sm:h-20 sm:w-20",
                compact ? "h-12 w-12" : "h-24 w-24",
              )}
            />
          </Link>
          <div className="hidden lg:block">{renderNavLinks("desktop")}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="tilt-hover rounded-full border border-white/10 bg-white/5 px-3 text-xs uppercase tracking-[0.24em] text-foreground/80 hover:text-white"
              onClick={onAccessibility}
            >
              <Accessibility className="h-4 w-4" />
              <span>Access</span>
            </Button>
          </div>
          <Button
            size="sm"
            className="tilt-hover hidden md:inline-flex rounded-full bg-primary text-primary-foreground shadow-glow hover:brightness-110"
            onClick={onJoin}
          >
            Join the Crew
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="inline-flex rounded-full border border-white/10 bg-white/5 text-foreground lg:hidden"
                aria-label="Toggle navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="glass-panel border border-white/10 backdrop-blur-2xl text-foreground"
            >
              <div className="flex flex-col gap-6 pt-12">
                <Link
                  to="/"
                  className="flex items-center gap-0 rounded-full font-display text-lg"
                >
                  <OptimizedImage src="/piratagelogo.webp" alt="Piratage logo" width={32} height={32} className="h-8 w-8" />
                </Link>
                {renderNavLinks("mobile")}
                <div className="flex flex-col gap-4">
                  <Button
                    variant="ghost"
                    className="justify-start gap-3 text-sm"
                    onClick={onAccessibility}
                  >
                    <Accessibility className="h-4 w-4" /> Accessibility
                    preferences
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground shadow-glow hover:brightness-110"
                    onClick={onJoin}
                  >
                    Join the Crew
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;