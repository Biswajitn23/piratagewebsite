import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Linkedin, Instagram } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { members, type MemberRole, type MemberRecord } from "@/data/pirtatage";


// MemberRole categories for filtering
const roleCategories = [
  { label: "Leadership" },
  { label: "Events" },
  { label: "Technical" },
  { label: "Design" },
  { label: "Operations" },
];

if (typeof window !== "undefined" && gsap) {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch {}
}

const MembersSection = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!rootRef.current || isReduced || isMobile) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".team-card");
      cards.forEach((card, index) => {
        const dir = index % 3 === 0 ? -40 : index % 3 === 1 ? 40 : 0;
        gsap.fromTo(
          card,
          { opacity: 0, y: 60, x: dir, scale: 0.92 },
          {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            delay: index * 0.08,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play reverse play reverse",
              invalidateOnRefresh: true,
            },
            onStart: () => {
              // Animate avatar floating
              const avatar = card.querySelector('.member-avatar');
              if (avatar) {
                gsap.to(avatar, {
                  y: "-=10",
                  repeat: -1,
                  yoyo: true,
                  duration: 2.2,
                  ease: "sine.inOut",
                });
              }
              // Animate social icons
              const icons = card.querySelectorAll('.tilt-hover');
              icons.forEach((icon, i) => {
                gsap.fromTo(icon, { rotate: -10, opacity: 0 }, { rotate: 0, opacity: 1, duration: 0.5, delay: 0.2 + i * 0.1, ease: "back.out(2)" });
              });
            }
          },
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const filteredMembers = useMemo(() => {
    if (activeCategory === "All") {
      return members;
    }
    // Filter by MemberRole (Leadership, Events, Technical, Design, Operations)
    return members.filter((member) => member.roles.includes(activeCategory as any));
  }, [activeCategory]);

  return (
    <section
      id="members"
      ref={rootRef}
      className="team-section relative mx-auto mt-16 md:mt-32 flex max-w-6xl flex-col gap-8 md:gap-12 px-4 md:px-6"
      style={{ marginTop: 0, paddingTop: 0 }}
      aria-labelledby="members-title"
    >
      <div className="space-y-4 text-center">
        <h2 id="members-title" className="font-display text-4xl text-glow" style={{ lineHeight: 1, marginTop: 0 }}>
          The Crew
        </h2>
        <p className="mx-auto max-w-3xl text-base text-muted-foreground">
          The builders, protectors, and dreamers behind the club.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.24em]">
          <Button
            variant={activeCategory === "All" ? "default" : "ghost"}
            className="rounded-full border border-white/10 bg-white/10"
            onClick={() => setActiveCategory("All")}
          >
            All
          </Button>
          {roleCategories.map((category) => (
            <Button
              key={category.label}
              variant={activeCategory === category.label ? "default" : "ghost"}
              className="rounded-full border border-white/10 bg-white/10"
              onClick={() => setActiveCategory(category.label)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <article
            key={member.id}
            data-cardid={member.id}
            className="team-card group glass-panel flex flex-col gap-4 rounded-[28px] border border-white/10 p-6 transition-transform duration-500 hover:-translate-y-1 hover:shadow-glow cursor-pointer"
            onClick={() => setSelectedMember(member)}
          >
            <div className="flex items-center gap-4">
              <img
                src={member.avatarImage}
                alt={member.name}
                loading="lazy"
                decoding="async"
                className="member-avatar h-16 w-16 rounded-2xl object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div>
                <h3 className="font-display text-lg text-foreground group-hover:text-accent transition-colors">
                  {member.name}
                </h3>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {member.position}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.roles.map((role) => (
                <Badge
                  key={role}
                  variant="secondary"
                  className="rounded-full border border-white/10 bg-white/10 text-[10px] uppercase tracking-[0.3em]"
                >
                  {role}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/80">{member.notable}</p>
            {(member.social.linkedin || member.social.instagram) && (
              <div className="mt-auto flex gap-3 text-muted-foreground">
                {member.social.linkedin && (
                  <a
                    href={member.social.linkedin}
                    className="tilt-hover inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
                    aria-label={`${member.name} LinkedIn`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {member.social.instagram && (
                  <a
                    href={member.social.instagram}
                    className="tilt-hover inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
                    aria-label={`${member.name} Instagram`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Member Detail Modal */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl bg-[#14141c] border-white/10">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-foreground">
                  {selectedMember.name}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <img
                    src={selectedMember.avatarImage}
                    alt={selectedMember.name}
                    className="w-full md:w-64 h-auto rounded-2xl object-cover"
                  />
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground mb-2">
                        Position
                      </p>
                      <p className="font-display text-xl text-foreground">
                        {selectedMember.position}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground mb-2">
                        Roles
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.roles.map((role) => (
                          <Badge
                            key={role}
                            variant="secondary"
                            className="rounded-full border border-white/10 bg-white/10 text-[10px] uppercase tracking-[0.3em]"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {selectedMember.notable && (
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground mb-2">
                          Notable
                        </p>
                        <p className="text-sm text-muted-foreground/80">
                          {selectedMember.notable}
                        </p>
                      </div>
                    )}
                    {(selectedMember.social.linkedin || selectedMember.social.instagram) && (
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground mb-3">
                          Connect
                        </p>
                        <div className="flex gap-3 text-muted-foreground">
                          {selectedMember.social.linkedin && (
                            <a
                              href={selectedMember.social.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tilt-hover inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                              aria-label={`${selectedMember.name} LinkedIn`}
                            >
                              <Linkedin className="h-5 w-5" />
                            </a>
                          )}
                          {selectedMember.social.instagram && (
                            <a
                              href={selectedMember.social.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tilt-hover inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                              aria-label={`${selectedMember.name} Instagram`}
                            >
                              <Instagram className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MembersSection;
