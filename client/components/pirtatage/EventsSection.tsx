import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarDays, ExternalLink, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { events as staticEvents, type EventRecord } from "@/data/pirtatage";
import type { EventRecordDTO, ListEventsResponse } from "@shared/api";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const EventsSection = () => {
  const [allEvents, setAllEvents] = useState<EventRecord[]>(staticEvents);
  const upcoming = useMemo(() => allEvents.filter((event) => event.status === "upcoming"), [allEvents]);
  const past = useMemo(() => allEvents.filter((event) => event.status === "past"), [allEvents]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [horizontalActive, setHorizontalActive] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventRecord | null>(null);

  useEffect(() => {
    // Fetch events from API; fallback to static
    const load = async () => {
      try {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error("Failed to load events");
        const data = (await res.json()) as ListEventsResponse;
        const mapped: EventRecord[] = data.events.map((e: EventRecordDTO) => ({
          ...e,
        }));
        if (!mapped.length) {
          setAllEvents(staticEvents);
        } else {
          setAllEvents(mapped);
        }
      } catch (_) {
        setAllEvents(staticEvents);
      }
    };
    load();

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;

    if (!containerRef.current || isReduced || isMobile) {
      return;
    }

    const ctx = gsap.context(() => {
      const el = containerRef.current!;
      const horizontalWrapper = el.querySelector<HTMLElement>(".past-events-track");
      if (!horizontalWrapper) {
        return;
      }

      const totalWidth = () => horizontalWrapper.scrollWidth;
      const viewportWidth = () => el.offsetWidth;

      const tween = gsap.to(horizontalWrapper, {
        x: () => -(Math.max(0, totalWidth() - viewportWidth())),
        ease: "none",
      });

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${Math.max(0, totalWidth() - viewportWidth())}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        onToggle({ isActive }) {
          setHorizontalActive(isActive);
        },
        animation: tween,
      });

      const lenis = (window as any).__lenis;
      if (lenis && typeof lenis.on === "function") {
        lenis.on("scroll", () => ScrollTrigger.update());
      }
    }, containerRef);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="events"
      className="relative flex flex-col gap-12 bg-[#04011a]/60 py-24"
      aria-labelledby="events-title"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6">
        <div className="flex flex-col gap-4 text-center lg:text-left">
          <h2 id="events-title" className="font-display text-4xl text-glow">
            Events radar
          </h2>
          <p className="text-base text-muted-foreground">
            Upcoming missions you can RSVP to and a hall of past scrims captured in holographic snapshots.
          </p>
        </div>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <Timer className="h-4 w-4 text-neon-teal" /> Upcoming Operations
            </h3>
            <div className="space-y-6">
              {upcoming.map((event) => (
                <article
                  key={event.id}
                  className="glass-panel relative flex flex-col gap-4 rounded-3xl border border-white/10 p-6 shadow-glass"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        {new Date(event.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                        })}
                      </p>
                      <h4 className="font-display text-xl text-foreground">{event.title}</h4>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      {event.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground/80">
                    {event.speakers.map((speaker) => (
                      <span key={speaker.name} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {speaker.name} • {speaker.role}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    className="self-start gap-2 text-xs uppercase tracking-[0.24em] text-primary"
                    asChild
                  >
                    <a href={event.registrationLink} target="_blank" rel="noreferrer">
                      Register <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </article>
              ))}
            </div>
          </div>
          <div
            ref={containerRef}
            className="relative rounded-[28px] border border-white/10 bg-white/5 overflow-x-hidden lg:overflow-hidden touch-pan-y lg:touch-pan-x"
            aria-live="polite"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#05021a]/90 px-6 py-4">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-neon-purple" /> Past Operations
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
                {horizontalActive ? "Drag or scroll" : "Scroll to explore"}
              </span>
            </div>
            <div className="past-events-track flex flex-col lg:flex-row gap-5 px-5 py-5 h-auto lg:h-[360px] lg:will-change-transform">
              {past.map((event) => (
                <figure
                  key={event.id}
                  className="relative flex w-full lg:min-w-[300px] lg:max-w-[340px] lg:shrink-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-black/30"
                >
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    sizes="(max-width: 1024px) 100vw, 340px"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-5 text-sm text-muted-foreground">
                    <h4 className="font-display text-lg text-foreground">{event.title}</h4>
                    <p className="line-clamp-3">{event.description}</p>
                    <button
                      type="button"
                      onClick={() => setActiveEvent(event)}
                      className="mt-auto inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-primary"
                    >
                      Expand recap
                    </button>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={Boolean(activeEvent)} onOpenChange={(open) => (!open ? setActiveEvent(null) : undefined)}>
        <DialogContent className="glass-panel max-w-4xl border border-white/10 bg-[#060218]/90 text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-glow">
              {activeEvent?.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {activeEvent?.description}
            </DialogDescription>
          </DialogHeader>
          {activeEvent ? (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <img
                  src={activeEvent.coverImage}
                  alt={activeEvent.title}
                  className="h-64 w-full rounded-3xl object-cover"
                />
                <div className="flex flex-wrap gap-2 text-xs">
                  {activeEvent.gallery.map((item) => (
                    <img
                      key={item}
                      src={item}
                      alt="Event gallery"
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Date:</strong> {new Date(activeEvent.date).toLocaleString()}
                </p>
                <p>
                  <strong className="text-foreground">Type:</strong> {activeEvent.type}
                </p>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Speakers</p>
                  <ul className="mt-2 space-y-2">
                    {activeEvent.speakers.map((speaker) => (
                      <li key={speaker.name} className="flex items-center gap-3">
                        <img
                          src={speaker.avatar}
                          alt={speaker.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-foreground">{speaker.name}</p>
                          <p className="text-xs text-muted-foreground/80">{speaker.role}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                {activeEvent.highlightScene ? (
                  <iframe
                    src={activeEvent.highlightScene}
                    title={`${activeEvent.title} highlight scene`}
                    className="h-48 w-full rounded-2xl border border-white/10"
                    allow="autoplay"
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default EventsSection;
