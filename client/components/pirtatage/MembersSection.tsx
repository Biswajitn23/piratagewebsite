import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Github, Linkedin, Twitter, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { members, achievements, type MemberRole } from "@/data/pirtatage";

const roles: MemberRole[] = [
  "Exec",
  "Mentor",
  "DevSecOps",
  "Research",
  "Outreach",
];

if (typeof window !== "undefined" && gsap) {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch {}
}

const MembersSection = () => {
  const [activeRole, setActiveRole] = useState<MemberRole | "All">("All");
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
          { opacity: 0, y: 50, x: dir },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              once: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const filteredMembers = useMemo(() => {
    if (activeRole === "All") {
      return members;
    }
    return members.filter((member) => member.roles.includes(activeRole));
  }, [activeRole]);

  return (
    <section
      id="members"
      ref={rootRef}
      className="team-section relative mx-auto mt-32 flex max-w-6xl flex-col gap-12 px-6"
      aria-labelledby="members-title"
    >
      <div className="space-y-4 text-center">
        <h2 id="members-title" className="font-display text-4xl text-glow">
          The Crew
        </h2>
        <p className="mx-auto max-w-3xl text-base text-muted-foreground">
          The builders, protectors, and dreamers behind the project.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.24em]">
          <Button
            variant={activeRole === "All" ? "default" : "ghost"}
            className="rounded-full border border-white/10 bg-white/10"
            onClick={() => setActiveRole("All")}
          >
            All
          </Button>
          {roles.map((role) => (
            <Button
              key={role}
              variant={activeRole === role ? "default" : "ghost"}
              className="rounded-full border border-white/10 bg-white/10"
              onClick={() => setActiveRole(role)}
            >
              {role}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <article
            key={member.id}
            data-cardid={member.id}
            className="team-card group glass-panel flex flex-col gap-4 rounded-[28px] border border-white/10 p-6 transition-transform duration-500 hover:-translate-y-1 hover:shadow-glow"
          >
            <div className="flex items-center gap-4">
              <img
                src={member.avatarImage}
                alt={member.name}
                className="h-16 w-16 rounded-2xl object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
            <p className="text-sm text-muted-foreground">{member.bio}</p>
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
            <div className="mt-auto flex gap-3 text-muted-foreground">
              {member.social.github ? (
                <a
                  href={member.social.github}
                  className="tilt-hover inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
                  aria-label={`${member.name} GitHub`}
                >
                  <Github className="h-4 w-4" />
                </a>
              ) : null}
              {member.social.linkedin ? (
                <a
                  href={member.social.linkedin}
                  className="tilt-hover inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
                  aria-label={`${member.name} LinkedIn`}
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              ) : null}
              {member.social.twitter ? (
                <a
                  href={member.social.twitter}
                  className="tilt-hover inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
                  aria-label={`${member.name} X profile`}
                >
                  <Twitter className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <aside className="glass-panel flex flex-col gap-6 rounded-3xl border border-white/10 p-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <Wand2 className="h-4 w-4 text-accent" /> Hall of Guardians
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground"
            >
              <h4 className="font-display text-lg text-foreground">
                {achievement.title}
              </h4>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80">
                {achievement.type} — {new Date(achievement.date).getFullYear()}
              </p>
              <p className="mt-2 text-[13px]">{achievement.description}</p>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
};

export default MembersSection;
