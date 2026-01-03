import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GalleryItem } from "@/data/pirtatage";
import {
  Dialog,
  DialogTrigger,
  DialogContent
} from "@/components/ui/dialog";

// We'll fetch gallery items from the server API so uploads in Supabase appear here.

if (typeof window !== "undefined" && gsap) {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch {}
}

const GallerySection = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);

  // Load gallery items from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/gallery');
        if (!res.ok) throw new Error('Failed to load gallery');
        const json = await res.json();
        const loaded: GalleryItem[] = (json.items || []).map((it: any) => ({
          id: String(it.id),
          title: it.title,
          category: it.category || '',
          media: it.media || '',
          orientation: (it.orientation as any) || 'landscape',
          description: it.description || '',
        }));
        if (mounted) setItems(loaded);
      } catch (err) {
        // keep empty
      }
    })();
    return () => { mounted = false; };
  }, []);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [gsapActive, setGsapActive] = useState(false);

  useEffect(() => {
    const mm = window.matchMedia("(max-width: 1023px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setIsMobile(mm.matches);
      setPrefersReducedMotion(rm.matches);
    };
    update();
    mm.addEventListener("change", update);
    rm.addEventListener("change", update);
    return () => {
      mm.removeEventListener("change", update);
      rm.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    // Only run GSAP horizontal scroll/ScrollTrigger on desktop (skip on mobile/reduced-motion)
    if (isMobile || prefersReducedMotion) return;
    if (!rootRef.current) return;

    const el = rootRef.current;
    const track = el.querySelector<HTMLElement>(".gallery-track");
    if (!track) return;

    // Check if screen is large enough for GSAP (1024px+)
    const isLargeScreen = window.innerWidth >= 1024;
    if (!isLargeScreen) return; // Let drag work on tablets

    // Only activate GSAP if content is scrollable
    const totalWidth = () => track.scrollWidth;
    const viewportWidth = () => el.clientWidth;
    if (totalWidth() <= viewportWidth()) {
      setGsapActive(false);
      return;
    }

    setGsapActive(true);

    const tween = gsap.to(track, {
      x: () => -(Math.max(0, totalWidth() - viewportWidth())),
      ease: "none",
    });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 104px",
        end: () => `+=${Math.max(0, totalWidth() - viewportWidth())}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        animation: tween,
      });

      gsap.utils.toArray<HTMLElement>(".gallery-item").forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0.12, x: 60 },
          {
            opacity: 1,
            x: 0,
            ease: "power1.out",
            scrollTrigger: {
              trigger: item,
              containerAnimation: tween,
              start: "left 85%",
              end: "left 60%",
              scrub: true,
            },
          },
        );
      });

      // Lenis -> ScrollTrigger update is handled globally in `use-lenis`
    }, rootRef);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    // Also refresh ScrollTrigger when items change (gallery loads)
    setTimeout(() => ScrollTrigger.refresh(), 200);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
      setGsapActive(false);
    };
  }, [isMobile, prefersReducedMotion, items]);

  // Drag functionality for gallery (only when GSAP is not active)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gsapActive || !trackRef.current) return;
    const track = trackRef.current;
    setIsDragging(true);
    setStartX(e.pageX - track.offsetLeft);
    setScrollLeft(track.scrollLeft);
    track.style.cursor = 'grabbing';
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gsapActive || !isDragging || !trackRef.current) return;
    e.preventDefault();
    const track = trackRef.current;
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 2;
    track.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (gsapActive) return;
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    if (gsapActive || !isDragging) return;
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.style.cursor = 'grab';
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gsapActive || !trackRef.current) return;
    const track = trackRef.current;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - track.offsetLeft);
    setScrollLeft(track.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gsapActive || !isDragging || !trackRef.current) return;
    const track = trackRef.current;
    const x = e.touches[0].pageX - track.offsetLeft;
    const walk = (x - startX) * 2;
    track.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    if (gsapActive) return;
    setIsDragging(false);
  };

  // Mobile lazy-load images to reduce decode and paint work
  useEffect(() => {
    if (!isMobile || !rootRef.current) return;
    const imgs = Array.from(rootRef.current.querySelectorAll<HTMLImageElement>('img[data-src]'));
    if (!imgs.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.getAttribute('data-src');
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              io.unobserve(img);
            }
          }
        });
      },
      { root: null, rootMargin: '300px 0px', threshold: 0.01 },
    );

    imgs.forEach((img) => io.observe(img));
    return () => io.disconnect();
  }, [isMobile, rootRef]);

  // Dialog state for gallery details
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  // Mobile simplified layout - same UI as desktop but with scroll instead of GSAP
  if (isMobile) {
    return (
      <section id="gallery" className="relative mt-24 mb-12" aria-labelledby="gallery-title">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="rounded-[28px] border border-white/10 bg-white/5">
            <div ref={rootRef} className="relative rounded-[28px] overflow-hidden">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#05021a]/85 px-4 py-3 md:px-6 md:py-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                  <h2 id="gallery-title" className="font-display text-xl sm:text-2xl text-foreground">
                    Gallery
                  </h2>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.28em] text-muted-foreground/80">Field ops • Labs • Scrims</p>
                </div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.28em] text-muted-foreground/70 flex-shrink-0">
                  Scroll
                </span>
              </div>
              <div 
                ref={trackRef}
                className="gallery-track flex flex-row gap-5 px-5 py-5 h-auto min-h-[420px] md:h-[420px] md:gap-6 md:px-6 md:py-6 overflow-x-auto select-none scroll-smooth"
                style={{ cursor: 'grab', scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {items.map((item) => (
                  <Dialog key={item.id} open={open && selected?.id === item.id} onOpenChange={(v) => { setOpen(v); if (!v) setSelected(null); }}>
                    <DialogTrigger asChild>
                      <figure
                        className="gallery-item group relative flex min-w-[280px] max-w-[280px] h-auto shrink-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/30 cursor-pointer md:desktop-hover-lift md:desktop-hover-scale"
                        onClick={() => { setSelected(item); setOpen(true); }}
                      >
                        <img
                          src={item.media}
                          alt={item.title}
                          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105 flex-shrink-0"
                          loading="lazy"
                          decoding="async"
                          sizes="280px"
                          width={280}
                          height={192}
                        />
                        <figcaption className="flex flex-col p-4 text-sm text-muted-foreground">
                          <strong className="font-display text-base text-foreground line-clamp-2">{item.title}</strong>
                          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/80 mt-1">{item.category}</span>
                          <p className="mt-2 text-xs leading-relaxed">{item.description}</p>
                          {isMobile && (
                            <span className="mt-2 text-[10px] text-muted-foreground/60 italic">
                              Click to see full
                            </span>
                          )}
                        </figcaption>
                        <div
                          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          style={{
                            background:
                              "radial-gradient(80% 80% at 50% 60%, rgba(173,83,137,0.22), transparent 60%), radial-gradient(60% 60% at 40% 30%, rgba(0,255,209,0.16), transparent 70%)",
                          }}
                        />
                      </figure>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="flex flex-col gap-4">
                        <h3 className="font-display text-xl text-foreground">{item.title}</h3>
                        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80">{item.category}</div>
                        <img src={item.media} alt={item.title} className="w-full rounded-xl object-cover" loading="lazy" decoding="async" width={1200} height={800} />
                        <p className="mt-2 text-[13px] leading-relaxed">{item.description}</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>

              {/* Hide scrollbar with CSS */}
              <style>{`
                #gallery .gallery-track::-webkit-scrollbar {
                  height: 6px;
                }
                #gallery .gallery-track::-webkit-scrollbar-track {
                  background: rgba(255,255,255,0.05);
                }
                #gallery .gallery-track::-webkit-scrollbar-thumb {
                  background: rgba(255,255,255,0.2);
                  border-radius: 3px;
                }
              `}</style>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Desktop/Tablet (unchanged horizontal experience)
  return (
    <section id="gallery" className="relative mt-24 mb-12 z-0" aria-labelledby="gallery-title">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="rounded-[28px] border border-white/10 bg-white/5">
          <div ref={rootRef} className="relative rounded-[28px] overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#05021a]/85 px-5 py-3 md:px-6 md:py-4">
              <div className="flex items-baseline gap-4">
                <h2 id="gallery-title" className="font-display text-2xl text-foreground">
                  Gallery
                </h2>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground/80">Field ops • Labs • Scrims</p>
              </div>
              <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">
                {gsapActive ? 'Scroll down' : 'Scroll or drag'}
              </span>
            </div>
            <div 
              ref={trackRef}
              className="gallery-track flex flex-row gap-5 px-5 py-5 h-[320px] md:h-[420px] md:gap-6 md:px-6 md:py-6 overflow-x-auto lg:overflow-visible select-none"
              style={{ cursor: gsapActive ? 'default' : 'grab', scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {items.map((item) => (
                <Dialog key={item.id} open={open && selected?.id === item.id} onOpenChange={(v) => { setOpen(v); if (!v) setSelected(null); }}>
                  <DialogTrigger asChild>
                    <figure
                      className="gallery-item group relative flex lg:min-w-[420px] lg:max-w-[420px] lg:shrink-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/30 cursor-pointer md:desktop-hover-lift md:desktop-hover-scale"
                      onClick={() => { setSelected(item); setOpen(true); }}
                    >
                      <img
                        src={item.media}
                        alt={item.title}
                        className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 640px) 100vw, 420px"
                        width={1200}
                        height={800}
                      />
                      <figcaption className="flex flex-1 flex-col justify-end p-5 text-sm text-muted-foreground">
                        <strong className="font-display text-lg text-foreground">{item.title}</strong>
                        <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/80">{item.category}</span>
                        <p className="mt-2 text-[13px] leading-relaxed line-clamp-3">{item.description}</p>
                      </figcaption>
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{
                          background:
                            "radial-gradient(80% 80% at 50% 60%, rgba(173,83,137,0.22), transparent 60%), radial-gradient(60% 60% at 40% 30%, rgba(0,255,209,0.16), transparent 70%)",
                        }}
                      />
                    </figure>
                  </DialogTrigger>
                  <DialogContent>
                    <div className="flex flex-col gap-4">
                      <h3 className="font-display text-xl text-foreground">{item.title}</h3>
                      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80">{item.category}</div>
                      <img src={item.media} alt={item.title} className="w-full rounded-xl object-cover" loading="lazy" decoding="async" width={1200} height={800} />
                      <p className="mt-2 text-[13px] leading-relaxed">{item.description}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
