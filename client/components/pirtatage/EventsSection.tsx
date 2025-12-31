// Animation for Register Now button
const registerMoveStyle = `
@keyframes register-move {
  0%, 100% { transform: translateY(0); }
  20% { transform: translateY(-2px); }
  40% { transform: translateY(2px); }
  60% { transform: translateY(-2px); }
  80% { transform: translateY(2px); }
}
.animate-register-move {
  animation: register-move 1.6s infinite;
}
`;

import EventGalleryDialogContent from "./EventGalleryDialogContent";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CalendarDays,
  RefreshCw,
  Timer,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { events as staticEvents, type EventRecord } from "@/data/pirtatage";
import type { EventRecordDTO, ListEventsResponse } from "@shared/api";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const EventsSection = () => {
  // Inject animation style for button bounce
  if (typeof document !== "undefined" && !document.getElementById("register-move-style")) {
    const style = document.createElement("style");
    style.id = "register-move-style";
    style.innerHTML = registerMoveStyle;
    document.head.appendChild(style);
  }
  // Inject animated border style ONCE for Register Now button
  if (typeof document !== "undefined" && !document.getElementById("animated-border-btn-style")) {
    const style = document.createElement("style");
    style.id = "animated-border-btn-style";
    style.innerHTML = `
      .animated-border-btn {
        position: relative;
        z-index: 0;
        background: transparent;
      }
      .animated-border-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 0.5rem;
        padding: 2px;
        background: conic-gradient(from var(--angle,0deg), #00ffd0 10%, #fff 30%, #00ffd0 60%, #222 100%);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        z-index: 1;
        pointer-events: none;
        animation: rotate-border-btn 1.5s linear infinite;
      }
      @keyframes rotate-border-btn {
        to { --angle: 360deg; }
      }
    `;
    document.head.appendChild(style);
  }
  const [allEvents, setAllEvents] = useState<EventRecord[]>(staticEvents);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventRecord | null>(null);
  const [horizontalActive, setHorizontalActive] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  /* ---------------- DB FILTERS ---------------- */

  const ongoingEvents = useMemo(() => 
    allEvents.filter((e) => e.status === "ongoing"), 
  [allEvents]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return allEvents.filter((e) => {
      const t = Date.parse(e.date);
      return e.status === "upcoming" || (!Number.isNaN(t) && t > now && e.status !== "ongoing");
    });
  }, [allEvents]);

  const pastEvents = useMemo(() => {
    const now = Date.now();
    return allEvents.filter((e) => {
      const t = Date.parse(e.date);
      return e.status === "past" || (!Number.isNaN(t) && t <= now && e.status !== "ongoing");
    });
  }, [allEvents]);


  // --- Past event gallery indices ---
  const [imgIndices, setImgIndices] = useState<number[]>([]);

  // Auto-cycle past event cards
  useEffect(() => {
    setImgIndices(pastEvents.map(() => 0));
    if (pastEvents.length === 0) return;
    const interval = setInterval(() => {
      setImgIndices(prev => prev.map((idx, i) => {
        const images = [pastEvents[i]?.coverImage, ...(pastEvents[i]?.gallery || [])];
        if (images.length <= 1) return 0;
        return (idx + 1) % images.length;
      }));
    }, 3500); // Change every 3.5 seconds
    return () => clearInterval(interval);
  }, [pastEvents]);

  /* ---------------- DB FETCH ---------------- */

  const loadEvents = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/events?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("DB Fetch failed");
      const data = (await res.json()) as ListEventsResponse;
      
      const mapped = data.events.map((e: EventRecordDTO) => ({
        ...e,
        speakers: e.speakers || [],
        gallery: e.gallery || [],
        coverImage: e.coverImage || "",
        description: e.description || "",
      }));
      setAllEvents(mapped.length ? mapped : staticEvents);
    } catch {
      setAllEvents(staticEvents);
    } finally {
      setIsRefreshing(false);
    }
  };

  /* ---------------- GSAP LOGIC ---------------- */

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (!containerRef.current || pastEvents.length === 0) return;

    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (isMobile) return;

    const ctx = gsap.context(() => {
      const el = containerRef.current!;
      const track = el.querySelector(".past-events-track") as HTMLElement;
      if (!track) return;

      const scrollDistance = track.scrollWidth - el.offsetWidth;

      // Primary Horizontal Move
      const mainTween = gsap.to(track, {
        x: () => -scrollDistance,
        ease: "none",
        delay: 0.8, // Increased delay for later horizontal movement
      });

      // Progress Bar Logic
if (progressRef.current) {
  gsap.to(progressRef.current, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: el,
      start: "top 15%",  // Match the start above
      end: () => `+=${scrollDistance * 1.5}`, // Match the end above
      scrub: 1,
    }
  });
}

ScrollTrigger.create({
  trigger: el,
  start: "top 16%",      // Adjust this % to change when the heading/box pins
  end: () => `+=${scrollDistance * 1.5}`, // Multiply scrollDistance to slow down the speed
  pin: true,
  scrub: 1.5,              // Increase for a smoother, less "twitchy" scroll
  animation: mainTween,
  onToggle: ({ isActive }) => setHorizontalActive(isActive),
});
    }, containerRef);

    return () => ctx.revert();
  }, [pastEvents]);

  return (
    <section id="events" className="relative min-h-screen bg-[#050014] py-24">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-16">
          <div>
            <h2 className="font-display text-5xl text-glow text-white">Events Radar</h2>
            <p className="text-white/40 mt-2">Upcoming missions you can RSVP to and a hall of past scrims captured in holographic snapshots.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadEvents} 
            disabled={isRefreshing}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12">
          
          {/* LEFT: ACTIVE & UPCOMING */}
          <div className="space-y-10">
            {/* ACTIVE */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-4 w-4 text-teal-400 fill-teal-400/20" />
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-bold">Ongoing Events</h3>
              </div>
              {ongoingEvents.length > 0 ? (
                ongoingEvents.map(e => (
                  <div
                    key={e.id}
                    onClick={() => setActiveEvent(e)}
                    className="group cursor-pointer rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center p-4 w-full max-w-md"
                  >
                    <div className="w-full flex flex-col items-center justify-between bg-black/30 rounded-lg p-4 overflow-hidden relative">
                      {/* LIVE badge at top right */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="live-badge-animate text-[#00ffd0] font-bold text-xs px-3 py-1 rounded-full border-2 border-[#00ffd0] shadow-lg bg-transparent animate-blink-slow">LIVE</span>
                      <style>{`
                        @keyframes blink-slow {
                          0%, 100% { opacity: 1; }
                          50% { opacity: 0.3; }
                        }
                        .animate-blink-slow {
                          animation: blink-slow 1.6s infinite;
                        }
                      `}</style>
                      </div>
                      <div className="w-full h-32 mb-2 overflow-hidden rounded-md flex-shrink-0 bg-black/20 flex items-center justify-center">
                        {((e.gallery && e.gallery.length > 0) || e.coverImage) ? (
                          <img
                            src={e.gallery && e.gallery.length > 0 ? e.gallery[0] : e.coverImage}
                            alt={e.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white/30 text-xs">No Cover Image</span>
                        )}
                      </div>
                      <h4 className="font-display text-lg text-center leading-tight line-clamp-4 w-full max-w-full break-words text-white font-extrabold drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">{e.title}</h4>
                      <div className="font-bold rounded px-2 py-1 inline-block mb-1 mt-2" style={{color:'#00ffd0',background:'#0a192f'}}>
                        {new Date(e.date).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })} IST
                      </div>
                      {e.registrationLink && (
                        <a
                          href={e.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 mb-1 inline-block px-4 py-2 rounded-lg font-bold text-xs shadow-lg hover:scale-105 transition-transform animate-register-move animated-border-btn"
                          style={{background: 'transparent', color: '#00ffd0', position: 'relative', overflow: 'hidden'}} 
                          onClick={ev => ev.stopPropagation()}
                        >
                          <span className="relative z-10">Register Now</span>
                        </a>
                      )}
                      <div className="text-[15px] text-white/70 text-center mt-2 w-full max-w-full break-words leading-tight">
                        <div className="mt-1 flex flex-wrap items-center justify-center gap-4">
                          <span><span className="font-semibold text-white">Venue:</span> <span className="text-[#3fd8ff] font-bold">{e.venue}</span></span>
                          <span><span className="font-semibold text-white">Location:</span> <span className="text-[#3fd8ff] font-bold">{e.location}</span></span>
                        </div>
                      </div>
                      {e.speakers && e.speakers.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-2 w-full overflow-hidden">
                          {e.speakers.map((sp, idx) => (
                            <div key={sp.name + idx} className="flex items-center gap-2 bg-white/10 rounded px-2 py-1 max-w-[10rem] overflow-hidden">
                              {sp.avatar && <img src={sp.avatar} alt={sp.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                              <span className="text-[13px] text-white/80 font-medium truncate">{sp.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/20 text-xs italic">No live operations.</p>
              )}
            </div>

            {/* UPCOMING */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Timer className="h-4 w-4 text-purple-400" />
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-bold">Upcoming Events</h3>
              </div>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(e => (
                  <div
                    key={e.id}
                    onClick={() => setActiveEvent(e)}
                    className="group cursor-pointer rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center p-4 w-full max-w-md"
                    style={{ minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined }}
                  >
                    <div className="w-full flex flex-col items-center justify-between bg-black/30 rounded-lg p-4 overflow-hidden">
                      <div className="w-full h-32 mb-2 overflow-hidden rounded-md flex-shrink-0 bg-black/20 flex items-center justify-center">
                        {((e.gallery && e.gallery.length > 0) || e.coverImage) ? (
                          <img
                            src={e.gallery && e.gallery.length > 0 ? e.gallery[0] : e.coverImage}
                            alt={e.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white/30 text-xs">No Cover Image</span>
                        )}
                      </div>
                      <h4 className="font-display text-lg text-center leading-tight line-clamp-4 w-full max-w-full break-words text-white font-extrabold drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">{e.title}</h4>
                      <div className="text-[15px] text-white/70 text-center mt-2 w-full max-w-full break-words leading-tight">
                        <div className="font-bold rounded px-2 py-1 inline-block mb-1" style={{color:'#00ffd0',background:'#0a192f'}}>
                          {new Date(e.date).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })} IST
                        </div>
                        <div className="mt-1"><span className="font-semibold text-white">Venue:</span> <span className="text-[#3fd8ff] font-bold">{e.venue}</span></div>
                        <div><span className="font-semibold text-white">Location:</span> <span className="text-[#3fd8ff] font-bold">{e.location}</span></div>
                      </div>
                      {e.speakers && e.speakers.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-2 w-full overflow-hidden">
                          {e.speakers.map((sp, idx) => (
                            <div key={sp.name + idx} className="flex items-center gap-2 bg-white/10 rounded px-2 py-1 max-w-[10rem] overflow-hidden">
                              {sp.avatar && <img src={sp.avatar} alt={sp.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                              <span className="text-[13px] text-white/80 font-medium truncate">{sp.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/20 text-xs italic">Scanning for signals...</p>
              )}
            </div>
          </div>

          {/* RIGHT: HALL OF RECORDS */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-6 sticky top-[2.5rem] z-20 bg-[#050014]/80 backdrop-blur-md py-3" style={{backdropFilter: 'blur(8px)'}}>
              <CalendarDays className="h-4 w-4 text-blue-400" />
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-bold">Past Events</h3>
            </div>
            <div ref={containerRef} className="relative h-[480px] w-full rounded-3xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm">
              <div className="past-events-track flex items-center h-full px-6 gap-6">
                {pastEvents.map((e, i) => {
                  const images = [e.coverImage, ...(e.gallery || [])];
                  const imgIdx = imgIndices[i] || 0;
                  // Animated border CSS for Register Now button
                  // This must be outside the return to avoid JSX syntax errors
                  // Only inject once
                  if (typeof document !== "undefined" && !document.getElementById("animated-border-btn-style")) {
                    const style = document.createElement("style");
                    style.id = "animated-border-btn-style";
                    style.innerHTML = `
                      .animated-border-btn {
                        position: relative;
                        z-index: 0;
                      }
                      .animated-border-btn::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        border-radius: 0.5rem;
                        padding: 2px;
                        background: conic-gradient(from 0deg, #00ffd0, #fff, #00ffd0 100%);
                        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                        -webkit-mask-composite: xor;
                        mask-composite: exclude;
                        z-index: 1;
                        pointer-events: none;
                        animation: rotate-border-btn 2s linear infinite;
                      }
                      @keyframes rotate-border-btn {
                        100% { transform: rotate(360deg); }
                      }
                    `;
                    document.head.appendChild(style);
                  }

                  return (
                    <div key={e.id} className="min-w-[280px] max-w-md h-[360px] rounded-xl border border-white/10 bg-black/40 flex-shrink-0 group hover:border-purple-500/40 transition-all flex flex-col">
                      <div className="relative h-1/2 w-full overflow-hidden rounded-t-xl">
                        <img
                          src={images[imgIdx]}
                          alt={e.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                          onClick={() => setActiveEvent(e)}
                          style={{ cursor: 'pointer' }}
                        />
                        {images.length > 1 && (
                          <div className="absolute bottom-2 right-2 flex gap-1 bg-black/40 rounded-full px-2 py-1">
                            {images.map((_, idx) => (
                              <span
                                key={idx}
                                className={`inline-block w-2 h-2 rounded-full ${imgIdx === idx ? "bg-white" : "bg-white/30"}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div onClick={() => setActiveEvent(e)} style={{ cursor: 'pointer' }}>
                          <span className="text-[9px] text-purple-400 font-bold uppercase tracking-[0.2em]">
                            {new Date(e.date).toLocaleString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })} IST
                          </span>
                          <h4 className="text-white text-lg mt-1 font-display leading-tight">{e.title}</h4>
                          <p className="text-white/30 text-xs mt-2 line-clamp-2 leading-relaxed">{e.description}</p>
                        </div>
                        <div className="flex justify-center pt-2">
                          <button
                            className="px-3 py-1 rounded bg-purple-700/80 text-xs text-white font-semibold shadow hover:bg-purple-600 transition-colors"
                            onClick={() => setActiveEvent(e)}
                            type="button"
                          >
                            Expand Recap
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PROGRESS BAR */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                <div ref={progressRef} className="h-full bg-gradient-to-r from-teal-500 via-purple-500 to-blue-500 origin-left scale-x-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!activeEvent} onOpenChange={() => setActiveEvent(null)}>
        <DialogContent className="max-w-2xl bg-[#0a001a] border-white/10 text-white">
          {activeEvent && (
            <EventGalleryDialogContent event={activeEvent} />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default EventsSection;