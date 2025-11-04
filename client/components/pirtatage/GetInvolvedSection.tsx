import { useState, type SVGProps } from "react";
import { CalendarDays, CheckCircle2, Mail } from "lucide-react";

const Discord = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 7.5c0 0 1.8-3.5 8.9-3.5 7.1 0 8.9 3.5 8.9 3.5s.9 4.9.9 9.5c0 0-1.5 1.2-6.1 1.2-4.6 0-6.1-1.2-6.1-1.2s-1.8-.9-3.5-3.6c0 0-.8-4.8-.9-9.4z" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9.1" cy="11" r="1.05" fill="currentColor" />
    <circle cx="14.9" cy="11" r="1.05" fill="currentColor" />
  </svg>
);

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const GetInvolvedSection = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="get-involved"
      className="relative mx-auto mt-32 flex max-w-6xl flex-col gap-12 px-6"
      aria-labelledby="get-involved-title"
    >
      <div className="space-y-4 text-center">
        <h2 id="get-involved-title" className="font-display text-4xl text-glow">
          Get involved &amp; join
        </h2>
        <p className="mx-auto max-w-3xl text-base text-muted-foreground">
          Sign up, sync your calendar, and unlock the Novice badge. Choose volunteer roles and get instant access to our Discord.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="glass-panel rounded-3xl border border-white/10 p-8 shadow-glass w-full mx-auto lg:mx-0">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-neon-teal" />
              <h3 className="font-display text-2xl text-foreground">Badge Unlocked</h3>
              <p className="text-sm text-muted-foreground">
                You’re in queue! Expect a calendar invite and Discord link shortly.
              </p>
              <Button onClick={() => setSubmitted(false)} className="rounded-full">
                Submit another response
              </Button>
            </div>
          ) : (
            <form
              className="space-y-6 max-w-xl mx-auto lg:mx-0 w-full"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("pirtatage:get-involved"));
                }
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Name
                  <Input required placeholder="Your name" className="mt-2" />
                </label>
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Email
                  <Input required type="email" placeholder="you@university.edu" className="mt-2" />
                </label>
              </div>
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Which squad do you want to support?
                <Textarea rows={3} className="mt-2" placeholder="Tell us where you’d like to help." />
              </label>
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Red Team</span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Blue Team</span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Violet Research</span>
              </div>
              <Button
                type="submit"
                className="tilt-hover rounded-full bg-gradient-to-r from-neon-teal via-neon-purple to-accent px-8 py-6 text-base font-semibold text-primary-foreground shadow-glow mx-auto lg:mx-0"
              >
                Unlock Novice badge
              </Button>
            </form>
          )}
        </div>
        <div className="space-y-6 max-w-md mx-auto lg:mx-0 w-full">
          <div className="glass-panel no-blur-on-mobile flex items-center gap-4 rounded-3xl border border-white/10 p-6">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10 text-neon-teal">
              <Discord className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-lg text-foreground">Discord HQ</h3>
              <p className="text-sm text-muted-foreground">
                Hop into the lab chat, get mission pings, and access live CTF stream rooms.
              </p>
              <Button variant="ghost" className="mt-3 gap-2 text-xs uppercase tracking-[0.24em]" asChild>
                <a href="https://discord.gg/pirtatage" target="_blank" rel="noreferrer">
                  Join server
                </a>
              </Button>
            </div>
          </div>
          <div className="glass-panel no-blur-on-mobile flex items-center gap-4 rounded-3xl border border-white/10 p-6">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10 text-neon-purple">
              <CalendarDays className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-lg text-foreground">Sync the calendar</h3>
              <p className="text-sm text-muted-foreground">
                Subscribe to lab events (ICS) and never miss a drill, outreach day, or research log drop.
              </p>
              <Button variant="ghost" className="mt-3 gap-2 text-xs uppercase tracking-[0.24em]" asChild>
                <a href="https://pirtatage.club/calendar.ics" target="_blank" rel="noreferrer">
                  Download ICS
                </a>
              </Button>
            </div>
          </div>
          <div className="glass-panel no-blur-on-mobile flex items-center gap-4 rounded-3xl border border-white/10 p-6">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10 text-accent">
              <Mail className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-lg text-foreground">Volunteer roles</h3>
              <p className="text-sm text-muted-foreground">
                Need credit? We have graded mentorship tracks, outreach stipends, and research assistant slots.
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Email crew@pirtatage.club for role briefs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetInvolvedSection;
