import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarDays, ExternalLink, RefreshCw, Timer, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { events as staticEvents, type EventRecord } from "@/data/pirtatage";
import type { EventRecordDTO, ListEventsResponse } from "@shared/api";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const EventsSection = () => {
  const [allEvents, setAllEvents] = useState<EventRecord[]>(staticEvents);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Derive upcoming / past by date first (more robust). Fall back to `status` when
  // date is missing or invalid. Upcoming are events with date > now.
  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...allEvents]
      .filter((event) => {
        // Exclude explicit 'ongoing' events from upcoming (they have their own section)
        if (event.status === "ongoing") return false;
        const t = Date.parse(event.date);
        if (Number.isNaN(t)) return event.status === "upcoming";
        return t > now;
      })
      .sort((a, b) => (Date.parse(a.date) - Date.parse(b.date)));
  }, [allEvents]);

  const ongoing = useMemo(() => {
    return [...allEvents]
      .filter((event) => event.status === "ongoing")
      .sort((a, b) => (Date.parse(a.date) - Date.parse(b.date)));
  }, [allEvents]);

  const past = useMemo(() => {
    const now = Date.now();
    return [...allEvents]
      .filter((event) => {
        // Ongoing events should not be treated as past
        if (event.status === "ongoing") return false;
        const t = Date.parse(event.date);
        if (Number.isNaN(t)) return event.status === "past";
        return t <= now;
      })
      .sort((a, b) => (Date.parse(b.date) - Date.parse(a.date)));
  }, [allEvents]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [horizontalActive, setHorizontalActive] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventRecord | null>(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Function to load events
  const loadEvents = async () => {
    setIsRefreshing(true);
    try {
      // Add cache-busting parameter to prevent browser caching
      const res = await fetch(`/api/events?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!res.ok) throw new Error("Failed to load events");
      const data = (await res.json()) as ListEventsResponse;
      const mapped: EventRecord[] = data.events.map((e: EventRecordDTO) => ({
        ...e,
        speakers: (e.speakers || []) as EventRecord['speakers'],
        gallery: (e.gallery || []) as EventRecord['gallery'],
        coverImage: e.coverImage || '',
        description: e.description || '',
      }));
      if (!mapped.length) {
        setAllEvents(staticEvents);
      } else {
        setAllEvents(mapped);
      }
    } catch (_) {
      setAllEvents(staticEvents);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-play gallery images
  useEffect(() => {
    if (!activeEvent || !autoPlay) return;
    
    const allImages = [
      ...(activeEvent.coverImage ? [activeEvent.coverImage] : []),
      ...(activeEvent.gallery || [])
    ];
    
    if (allImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentGalleryIndex((prev) => (prev + 1) % allImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [activeEvent, autoPlay]);

  // Reset gallery index when event changes
  useEffect(() => {
    setCurrentGalleryIndex(0);
    setAutoPlay(true);
  }, [activeEvent]);

  useEffect(() => {
    loadEvents();

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
      className="relative flex flex-col gap-8 md:gap-12 bg-[#04011a]/60 py-12 md:py-24 mt-8 md:mt-14"
      aria-labelledby="events-title"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:gap-6 px-4 md:px-6">
        <div className="flex flex-col gap-4 text-center lg:text-left">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="events-title" className="font-display text-4xl text-glow">
                Events radar
              </h2>
              <p className="text-base text-muted-foreground">
                Upcoming missions you can RSVP to and a hall of past scrims captured in holographic snapshots.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadEvents}
              disabled={isRefreshing}
              className="gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground hover:text-primary"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            {/* Ongoing first */}
            {ongoing.length > 0 ? (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <Timer className="h-4 w-4 text-neon-amber" /> Ongoing Operations
                </h3>
                <div className="space-y-6">
                  {ongoing.map((event) => (
                    <article
                      key={event.id}
                      className="glass-panel relative flex flex-col gap-4 rounded-3xl border border-white/10 p-6 shadow-glass cursor-pointer hover:border-white/20 hover:shadow-glass-lg transition-all"
                      onClick={() => setActiveEvent(event)}
                    >
                      {event.coverImage ? (
                        <img
                          src={event.coverImage}
                          alt={event.title}
                          loading="lazy"
                          decoding="async"
                          className="h-48 w-full rounded-2xl object-cover"
                        />
                      ) : null}
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
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-amber-300">
                          Ongoing
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground/80">
                        {(event.speakers || []).map((speaker) => (
                          <span key={speaker.name} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            {speaker.name} • {speaker.role}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-end justify-between">
                        <Button
                          variant="ghost"
                          className="gap-2 text-xs uppercase tracking-[0.24em] text-primary"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a href={event.registrationLink} target="_blank" rel="noreferrer">
                            Join Now <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                        <p className="text-[10px] text-muted-foreground/60 italic">
                          Click to see details
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Upcoming after Ongoing */}
            <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <Timer className="h-4 w-4 text-neon-teal" /> Upcoming Operations
            </h3>
            <div className="space-y-6">
              {upcoming.map((event) => (
                <article
                  key={event.id}
                  className="glass-panel relative flex flex-col gap-4 rounded-3xl border border-white/10 p-6 shadow-glass cursor-pointer hover:border-white/20 hover:shadow-glass-lg transition-all"
                  onClick={() => setActiveEvent(event)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-neon-teal" />
                          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            {new Date(event.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-neon-teal" />
                          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            {new Date(event.date).toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <h4 className="font-display text-xl text-foreground mb-2">{event.title}</h4>
                      <span className="inline-block rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-3">
                        {event.type}
                      </span>
                      <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                      {(event.location || event.venue) && (
                        <p className="text-xs text-muted-foreground/80">
                          📍 {event.location}{event.venue ? ` • ${event.venue}` : ''}
                        </p>
                      )}
                      
                      {/* Register Now button if registration link exists */}
                      {event.registrationLink && (
                        <Button
                          variant="ghost"
                          className="mt-3 gap-2 text-xs uppercase tracking-[0.24em] text-primary"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a href={event.registrationLink} target="_blank" rel="noreferrer">
                            Register Now <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      
                      <p className="text-[10px] text-muted-foreground/60 mt-2 italic">
                        Click to know more details
                      </p>
                    </div>
                    
                    {/* Show all speaker images for workshops and speaker sessions */}
                    {(() => {
                      const eventType = event.type?.toLowerCase() || '';
                      const showSpeakerPhoto = (eventType.includes('workshop') || eventType.includes('speaker')) 
                        && !eventType.includes('hackathon') 
                        && !eventType.includes('ideathon');
                      
                      return showSpeakerPhoto && event.speakers && event.speakers.length > 0 ? (
                        <div className="flex-shrink-0 flex flex-col gap-3">
                          {event.speakers.slice(0, 3).map((speaker) => (
                            speaker.image ? (
                              <div key={speaker.name} className="flex flex-col items-center">
                                <img
                                  src={speaker.image}
                                  alt={speaker.name}
                                  className="w-24 h-24 rounded-2xl object-cover border border-white/10"
                                />
                                <p className="text-xs text-center text-muted-foreground mt-2">
                                  {speaker.name}
                                </p>
                              </div>
                            ) : null
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div
            ref={containerRef}
            className="relative rounded-[28px] border border-white/10 bg-white/5 overflow-x-auto lg:overflow-hidden"
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
            <div className="past-events-track flex flex-col lg:flex-row gap-5 px-5 py-5 h-auto lg:h-[360px] lg:will-change-transform overflow-x-auto lg:overflow-visible" style={{ WebkitOverflowScrolling: 'touch' as const }}>
              {past.map((event) => (
                <figure
                  key={event.id}
                  className="relative flex w-full lg:min-w-[300px] lg:max-w-[340px] lg:shrink-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-black/30 min-h-[380px]"
                >
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                    sizes="(max-width: 1024px) 100vw, 340px"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-5 pb-7 text-sm text-muted-foreground min-h-[120px]">
                    <h4 className="font-display text-lg text-foreground">{event.title}</h4>
                    <p className="break-words whitespace-pre-line">{event.description}</p>
                    <button
                      type="button"
                      onClick={() => setActiveEvent(event)}
                      className="w-full inline-flex items-center justify-center gap-2 text-xs uppercase tracking-[0.24em] text-primary rounded-lg border border-primary/30 bg-black/10 px-4 py-2 shadow-md hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      style={{ minHeight: 36 }}
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
                {/* Main gallery image with navigation */}
                <div className="relative group">
                  {(() => {
                    // Create array with cover image first, then gallery images
                    const allImages = [
                      ...(activeEvent.coverImage ? [activeEvent.coverImage] : []),
                      ...(activeEvent.gallery || [])
                    ];
                    
                    return (
                      <>
                        <img
                          src={allImages[currentGalleryIndex] || activeEvent.coverImage}
                          alt={activeEvent.title}
                          className="h-64 w-full rounded-3xl object-cover transition-all duration-300"
                        />
                        
                        {/* Navigation buttons - only show if there are multiple images */}
                        {allImages.length > 1 && (
                          <>
                            <button
                              onClick={() => {
                                setAutoPlay(false);
                                setCurrentGalleryIndex((prev) =>
                                  prev === 0 ? allImages.length - 1 : prev - 1
                                );
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setAutoPlay(false);
                                setCurrentGalleryIndex((prev) =>
                                  (prev + 1) % allImages.length
                                );
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                              aria-label="Next image"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                            
                            {/* Image counter */}
                            <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                              {currentGalleryIndex + 1} / {allImages.length}
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
                
                {/* Thumbnail gallery */}
                {(() => {
                  const allImages = [
                    ...(activeEvent.coverImage ? [activeEvent.coverImage] : []),
                    ...(activeEvent.gallery || [])
                  ];
                  
                  return allImages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {allImages.map((item, index) => (
                        <button
                          key={`${item}-${index}`}
                          onClick={() => {
                            setAutoPlay(false);
                            setCurrentGalleryIndex(index);
                          }}
                          className={`h-16 w-16 rounded-xl border-2 transition-all ${
                            currentGalleryIndex === index
                              ? 'border-primary scale-105'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <img
                            src={item}
                            alt={`${index === 0 ? 'Cover' : 'Gallery'} ${index + 1}`}
                            className="h-full w-full rounded-lg object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Date:</strong> {new Date(activeEvent.date).toLocaleString()}
                </p>
                <p>
                  <strong className="text-foreground">Type:</strong> {activeEvent.type}
                </p>
                {(activeEvent.location || activeEvent.venue) && (
                  <p>
                    <strong className="text-foreground">Venue:</strong> {activeEvent.location}{activeEvent.venue ? ` • ${activeEvent.venue}` : ''}
                  </p>
                )}
                {activeEvent.speakers && activeEvent.speakers.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">Speakers</p>
                    <ul className="space-y-2">
                      {activeEvent.speakers.map((speaker, idx) => {
                        // Handle both string format and object format
                        if (typeof speaker === 'string') {
                          return (
                            <li key={idx} className="text-foreground">
                              • {speaker}
                            </li>
                          );
                        }
                        return (
                          <li key={speaker.name || idx} className="flex items-center gap-3">
                            {speaker.avatar && (
                              <img
                                src={speaker.avatar}
                                alt={speaker.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="text-foreground">{speaker.name}</p>
                              {speaker.role && <p className="text-xs text-muted-foreground/80">{speaker.role}</p>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {activeEvent.registrationLink && (
                  <Button
                    variant="default"
                    className="w-full gap-2"
                    asChild
                  >
                    <a href={activeEvent.registrationLink} target="_blank" rel="noreferrer">
                      Register Now <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
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
