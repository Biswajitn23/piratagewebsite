import "@/components/pirtatage/mission-blink.css";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Sparkles, UserCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const AboutSection = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      // Fade-in About section (use ref instead of selector)
      if (rootRef.current) {
        gsap.fromTo(
          rootRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 90%",
            },
          }
        );
      }

      // Animate mission cards: slide-up with stagger
      gsap.utils.toArray<HTMLElement>(".mission-card").forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: 0.2 + index * 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
          }
        );
      });

      // Floating effect for Piratage logo
      const logo = document.querySelector(".piratage-logo-zoom");
      if (logo) {
        gsap.fromTo(
          logo,
          { scale: 1.25, opacity: 0, y: 40 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: logo,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
        // Floating loop
        gsap.to(logo, {
          y: "-=12",
          repeat: -1,
          yoyo: true,
          duration: 2.5,
          ease: "sine.inOut",
        });
      }

      // Animated underline for heading
      gsap.fromTo(
        ".about-underline",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#about-title",
            start: "top 90%",
          },
        }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={rootRef}
      className="relative mx-auto mt-4 md:mt-6 lg:mt-8 max-w-6xl px-4 md:px-6"
      aria-labelledby="about-title"
    >
      <div className="w-full flex justify-center pt-8 pb-4">
        <h2 className="font-display text-4xl text-glow text-center text-neon-teal">About Club</h2>
      </div>
      <div className="relative rounded-3xl border border-neon-teal/30 bg-gradient-to-b from-white/5 to-black/20 backdrop-blur-xl overflow-hidden min-h-[400px] md:min-h-[600px]">
        <div className="relative h-full">
          <div className="space-y-4 md:space-y-6 p-6 md:p-8 lg:p-12 relative z-10 md:w-1/2">
            <h2 id="about-title" className="font-display text-2xl sm:text-3xl lg:text-4xl text-glow relative inline-block">
              What is PIRATAGE CLUB?
              <span className="about-underline blink-underline absolute left-0 -bottom-1 h-1 w-full bg-neon-teal/60 rounded-full origin-left scale-x-0" />
            </h2>
            <p className="text-xl font-bold text-foreground">
              PIRATAGE is a student-led ethical hacking community focused on protecting systems, not exploiting them.
            </p>
            <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
              <p>
                In the spirit of ethical hacking and cybersecurity excellence, Piratage is a student-driven community dedicated to learning, practicing, and mastering the art of security.
              </p>
              <p>
                Officially operating under <span className="text-neon-teal font-semibold">Amity University Chhattisgarh (ASET / AIIT)</span> and guided by faculty mentor <span className="text-neon-teal font-semibold">Mr. Pawan Kumar, Assistant Professor</span>, we bring together aspiring hackers, security researchers, and tech enthusiasts to explore vulnerabilities, compete in challenges, and build a safer digital world.
              </p>
              <p>
                Through workshops, hackathons, and collaborative projects, members gain hands-on experience with real-world security tools and techniques. Piratage transforms curiosity into expertise, creating a platform where passionate minds grow into responsible cybersecurity professionals.
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center absolute right-0 top-0 h-full w-1/2 rounded-r-3xl overflow-hidden p-0">
            <OptimizedImage
              src="/bg remove.png"
              alt="Piratage Logo"
              className="object-contain piratage-logo-zoom"
              style={{ width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%", transform: "scale(1.5)" }}
            />
          </div>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-3 mt-10">
        <article className="mission-card relative flex flex-col gap-4 rounded-3xl border border-white/15 bg-white/8 p-8 shadow-glass backdrop-blur-xl">
          <Shield className="h-8 w-8 text-neon-teal" aria-hidden="true" />
          <h3 className="font-display text-xl text-foreground">Ethical Security First</h3>
          <p className="text-sm text-muted-foreground">
            We follow responsible disclosure and ethical hacking practices. Every member commits to using skills for protection, not exploitation—keeping systems, users, and institutions safe.
          </p>
          <p className="text-xs font-semibold text-neon-teal italic">Ethics before execution.</p>
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="mt-auto inline-flex w-max items-center gap-2 text-xs uppercase tracking-[0.24em] text-primary hover:underline"
              >
                View our pledge
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-card border-neon-teal/40">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-bold text-neon-teal text-center">Our Pledge</DialogTitle>
                <DialogDescription className="text-center text-xs text-muted-foreground italic">
                  The PIRATAGE Ethical Commitment
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 text-sm">
                <p>We, the members of PIRATAGE – The Ethical Hacking Club, pledge to:</p>
                
                <ul className="space-y-2 list-disc list-inside pl-2">
                  <li>Practice ethical hacking only — using our skills to protect, not exploit</li>
                  <li>Respect authorization and privacy — no testing without explicit permission</li>
                  <li>Follow the law and university guidelines at all times</li>
                  <li>Support and respect our community, regardless of skill level</li>
                  <li>Disclose vulnerabilities responsibly, without causing harm</li>
                  <li>Continuously learn and share knowledge for the greater good</li>
                </ul>
                
                <p className="leading-relaxed">
                  We believe that curiosity guided by ethics creates security, and that true hackers are protectors of the digital world.
                </p>
                
                <p className="text-center font-semibold text-neon-teal italic pt-2">
                  Where hackers become protectors.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </article>
        <article className="mission-card relative flex flex-col gap-4 rounded-3xl border border-white/15 bg-white/8 p-8 shadow-glass backdrop-blur-xl">
          <Sparkles className="h-8 w-8 text-neon-purple" aria-hidden="true" />
          <h3 className="font-display text-xl text-foreground">Compete, Build & Grow</h3>
          <p className="text-base text-muted-foreground leading-relaxed">
            Through workshops, hackathons, and guided practice sessions, members develop practical cybersecurity skills by working on real-world scenarios and collaborative challenges.
          </p>
          <p className="text-sm font-semibold text-neon-purple italic mt-auto">Learn by building, not just reading.</p>
        </article>
        <article className="mission-card relative flex flex-col gap-4 rounded-3xl border border-white/15 bg-white/8 p-8 shadow-glass backdrop-blur-xl">
          <UserCheck className="h-8 w-8 text-accent" aria-hidden="true" />
          <h3 className="font-display text-xl text-foreground">Learn Together</h3>
          <p className="text-base text-muted-foreground leading-relaxed">
            Beginner or experienced—everyone belongs here. Expert-led sessions, peer mentoring, and collaborative projects help members grow at their own pace.
          </p>
          <p className="text-sm font-semibold text-accent italic mt-auto">No prior experience required.</p>
        </article>
      </div>
    </section>
  );
};

export default AboutSection;
