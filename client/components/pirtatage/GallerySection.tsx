import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GalleryItem } from "@/data/pirtatage";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mm = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mm.matches);
    update();
    mm.addEventListener("change", update);
    return () => mm.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    // Only run GSAP horizontal scroll/ScrollTrigger on non-mobile
    if (isMobile) return;
    if (!rootRef.current) return;

    const el = rootRef.current;
    const track = el.querySelector<HTMLElement>(".gallery-track");
    if (!track) return;

    const totalWidth = () => track.scrollWidth;
    const viewportWidth = () => el.clientWidth;

    const tween = gsap.to(track, {
      x: () => -(Math.max(0, totalWidth() - viewportWidth())),
      ease: "none",
    });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${Math.max(0, totalWidth() - viewportWidth())}`,
        pin: true,
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

      const lenis = (window as any).__lenis;
      if (lenis && typeof lenis.on === "function") {
        lenis.on("scroll", () => ScrollTrigger.update());
      }
    }, rootRef);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, [isMobile]);

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

  // Mobile simplified layout to avoid heavy paints and touch capture issues
  if (isMobile) {

    return (
      <section id="gallery" className="relative mt-24" aria-labelledby="gallery-title">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="rounded-[28px] border border-white/10 bg-white/5 no-blur-on-mobile">
            <div
              ref={rootRef}
              className="relative rounded-[28px] overflow-x-hidden touch-none"
              style={{ touchAction: "pan-y" }}
            >
              <div className="px-5 py-4">
                <h2 id="gallery-title" className="font-display text-2xl text-foreground">
                  Gallery
                </h2>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground/80">
                  Field ops • Labs • Scrims
                </p>
              </div>

              <div className="flex flex-col gap-5 px-4 pb-6">
                {items.map((item) => (
                  <figure
                    key={item.id}
                    className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                  >
                    <img
                      data-src={item.media}
                      alt={item.title}
                      className="w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      sizes="100vw"
                    />
                    <figcaption className="p-4 text-sm text-muted-foreground">
                      <strong className="font-display text-lg text-foreground">{item.title}</strong>
                      <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/80">{item.category}</div>
                      <p className="mt-2 text-[13px] leading-relaxed">{item.description}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Desktop/Tablet (unchanged horizontal experience)
  return (
    <section id="gallery" className="relative mt-24" aria-labelledby="gallery-title">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="rounded-[28px] border border-white/10 bg-white/5">
          <div ref={rootRef} className="relative rounded-[28px] overflow-x-visible touch-pan-x">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#05021a]/85 px-5 py-3 md:px-6 md:py-4">
              <div className="flex items-baseline gap-4">
                <h2 id="gallery-title" className="font-display text-2xl text-foreground">
                  Gallery
                </h2>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground/80">Field ops • Labs • Scrims</p>
              </div>
              <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">Scroll or drag</span>
            </div>
            <div className="gallery-track flex flex-row gap-5 px-5 py-5 h-[320px] md:h-[380px] md:gap-6 md:px-6 md:py-6 overflow-x-auto lg:overflow-visible">
              {items.map((item) => (
                <figure
                  key={item.id}
                  className="gallery-item group relative flex lg:min-w-[420px] lg:max-w-[420px] lg:shrink-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/30"
                >
                  <img
                    src={item.media}
                    alt={item.title}
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    sizes="(max-width: 640px) 100vw, 420px"
                  />
                  <figcaption className="flex flex-1 flex-col justify-end p-5 text-sm text-muted-foreground">
                    <strong className="font-display text-lg text-foreground">{item.title}</strong>
                    <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/80">{item.category}</span>
                    <p className="mt-2 text-[13px] leading-relaxed">{item.description}</p>
                  </figcaption>
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(80% 80% at 50% 60%, rgba(173,83,137,0.22), transparent 60%), radial-gradient(60% 60% at 40% 30%, rgba(0,255,209,0.16), transparent 70%)",
                    }}
                  />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
