import { useState, type SVGProps } from "react";
import { CalendarDays, CheckCircle2, Mail } from "lucide-react";

const WhatsApp = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.373 0 0 5.373 0 12c0 2.121.553 4.103 1.515 5.86L0 24l6.447-1.489A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12 0-1.919-.42-3.738-1.48-5.36z" fill="currentColor" />
    <path d="M17.2 14.1c-.4 1.1-1.6 2-2.7 2.2-1.1.2-1.9-.1-2.9-.6l-.7-.4c-.2-.1-.5-.1-.6.1l-1 1c.5.4 1.2.9 2 1.1.9.2 1.8.1 2.6-.3 1.3-.6 2.2-1.7 2.5-3.1.3-1.1 0-2.2-.7-3.1-.6-.8-1.6-1.4-2.6-1.4-.7 0-1.4.2-1.9.6-.5.4-.8.9-.9 1.1-.1.3 0 .5.2.7l1.1 1.1c.2.2.3.4.1.6-.1.2-.3.4-.5.6-.2.2-.5.4-.8.5-.6.2-1.2.1-1.7-.1-.8-.3-1.6-.8-2.2-1.4l-.1-.1c-.2-.2-.2-.5 0-.7l1.1-1.7c.4-.6 1-1.3 1.6-1.5.7-.2 1.6-.4 2.4-.2 1.9.4 3.3 1.8 3.6 3.7.1.6.1 1.2 0 1.7z" fill="#fff" />
  </svg>
);

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const GetInvolvedSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("General help");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <section
      id="need-help"
      className="relative mx-auto mt-32 flex max-w-6xl flex-col gap-12 px-6"
      aria-labelledby="need-help-title"
    >
      <div className="space-y-4 text-center">
        <h2 id="need-help-title" className="font-display text-4xl text-glow">
          Need help, enquiries or doubts?
        </h2>
        <p className="mx-auto max-w-3xl text-base text-muted-foreground">
          Have a question, need assistance with resources or want to report an issue? Send us a short message below and our team will reply via email.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="glass-panel rounded-3xl border border-white/10 p-8 shadow-glass w-full mx-auto lg:mx-0">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-neon-teal" />
              <h3 className="font-display text-2xl text-foreground">Request submitted</h3>
              <p className="text-sm text-muted-foreground">
                Thank you — we received your message. Our team will reply to the email you provided shortly.
              </p>
              <Button onClick={() => setSubmitted(false)} className="rounded-full">
                Send another request
              </Button>
            </div>
          ) : (
            <form
              className="space-y-6 max-w-xl mx-auto lg:mx-0 w-full"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = event.currentTarget as HTMLFormElement;
                const fd = new FormData(form);
                const name = (fd.get("name") as string) || "";
                const email = (fd.get("email") as string) || "";
                const message = (fd.get("message") as string) || "";

                setIsSubmitting(true);
                try {
                  const res = await fetch("/api/help", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, message, topic: selectedTopic }),
                  });
                  if (!res.ok) {
                    console.error("Failed to submit help request", await res.text());
                    // keep form visible so user can retry
                    setIsSubmitting(false);
                    return;
                  }
                  setSubmitted(true);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("pirtatage:need-help", { detail: { topic: selectedTopic } }));
                  }
                } catch (err) {
                  console.error("Failed to submit help request", err);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Name
                  <Input name="name" required placeholder="Your name" className="mt-2" />
                </label>
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Email
                  <Input name="email" required type="email" placeholder="you@university.edu" className="mt-2" />
                </label>
              </div>
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                How can we help?
                <Textarea name="message" rows={3} className="mt-2" placeholder="Describe your question, doubt or the help you need." />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  "General help",
                  "Events",
                  "Workshops",
                ].map((topic) => {
                  const active = selectedTopic === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSelectedTopic(topic)}
                      aria-pressed={active}
                      className={`text-xs uppercase tracking-[0.3em] px-3 py-1 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                        active
                          ? "bg-accent text-primary-foreground border-accent"
                          : "bg-white/10 border-white/10 text-muted-foreground hover:bg-white/20"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
                <input type="hidden" name="topic" value={selectedTopic} />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="tilt-hover rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-8 py-6 text-base font-semibold text-primary-foreground shadow-glow mx-auto lg:mx-0"
              >
                {isSubmitting ? "Sending…" : "Send request"}
              </Button>
            </form>
          )}
        </div>
        <div className="space-y-6 max-w-md mx-auto lg:mx-0 w-full">
          <div className="glass-panel no-blur-on-mobile flex items-center gap-4 rounded-3xl border border-white/10 p-6">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10 text-[#25D366]">
              <WhatsApp className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-lg text-foreground">WhatsApp Group</h3>
              <p className="text-sm text-muted-foreground">
                Join our WhatsApp group for quick event pings, study buddy pairing and workshop announcements.
              </p>
              <Button variant="ghost" className="mt-3 gap-2 text-xs uppercase tracking-[0.24em]" asChild>
                <a href="https://chat.whatsapp.com/HbpsxloTU0pKJ5pPAWzA3G" target="_blank" rel="noreferrer">
                  Join group
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
