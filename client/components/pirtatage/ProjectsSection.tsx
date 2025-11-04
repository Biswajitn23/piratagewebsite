import { useMemo } from "react";
import { Code2, ExternalLink, Github } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/pirtatage";

const ProjectsSection = () => {
  const items = useMemo(() => projects, []);

  return (
    <section
      id="projects"
      className="relative mx-auto mt-32 flex max-w-6xl flex-col gap-12 px-6"
      aria-labelledby="projects-title"
    >
      <div className="space-y-4 text-center">
        <h2 id="projects-title" className="font-display text-4xl text-glow">
          Projects &amp; case studies
        </h2>
        <p className="mx-auto max-w-3xl text-base text-muted-foreground">
          Interactive builds, live dashboards, and open-source tooling crafted by the crew. All CMS-powered so mentors can publish updates.
        </p>
      </div>
      <Carousel className="relative">
        <CarouselContent>
          {items.map((project) => (
            <CarouselItem key={project.id} className="md:basis-1/2 lg:basis-1/3">
              <article className="glass-panel flex h-full flex-col gap-4 rounded-3xl border border-white/10 p-6">
                <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  {project.thumbnail3D ? (
                    <iframe
                      src={project.thumbnail3D}
                      title={`${project.title} preview`}
                      className="h-full w-full"
                      loading="lazy"
                      allow="autoplay"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Preview loading…
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <h3 className="font-display text-xl text-foreground">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{project.summary}</p>
                  <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/80">{project.highlight}</p>
                </div>
                <div className="mt-auto flex flex-wrap gap-3 text-xs uppercase tracking-[0.24em]">
                  {project.liveDemo ? (
                    <Button variant="ghost" className="gap-2" asChild>
                      <a href={project.liveDemo} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" /> Live demo
                      </a>
                    </Button>
                  ) : null}
                  {project.repository ? (
                    <Button variant="ghost" className="gap-2" asChild>
                      <a href={project.repository} target="_blank" rel="noreferrer">
                        <Github className="h-4 w-4" /> Repository
                      </a>
                    </Button>
                  ) : null}
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-muted-foreground">
                    <Code2 className="h-3 w-3" /> Lo-fi mode available
                  </span>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="border-white/20 bg-white/10 text-foreground" />
        <CarouselNext className="border-white/20 bg-white/10 text-foreground" />
      </Carousel>
    </section>
  );
};

export default ProjectsSection;
