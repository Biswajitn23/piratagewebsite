import { Link } from "react-router-dom";
import { Radar, RotateCcw } from "lucide-react";

const NotFound = () => {
  return (
    <section className="relative mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-neon-purple/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-neon-teal/20 blur-3xl" aria-hidden="true" />
      <div className="glass-panel relative flex w-full flex-col items-center gap-6 rounded-[30px] border border-white/10 px-10 py-16">
        <span className="grid h-20 w-20 place-items-center rounded-full border border-neon-teal/40 bg-neon-teal/10 text-neon-teal">
          <Radar className="h-10 w-10" aria-hidden="true" />
        </span>
        <div className="space-y-4">
          <h1 className="font-display text-5xl text-glow">Signal Lost</h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            The route you pinged is outside our defended perimeter. Try heading
            back to HQ or jump into Events to see where the crew is hacking next.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="tilt-hover inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-neon-teal via-neon-purple to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Return Home
          </Link>
          <Link
            to="/#events"
            className="tilt-hover inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-foreground"
          >
            <RotateCcw className="h-4 w-4" /> Events Radar
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
