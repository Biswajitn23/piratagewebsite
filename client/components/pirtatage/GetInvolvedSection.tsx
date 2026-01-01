import { useState, type SVGProps } from "react";
import { CalendarDays, CheckCircle2, Mail, Download, Plus } from "lucide-react";


const WhatsApp = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const GetInvolvedSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("General help");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Email subscription state
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState("");

  const handleEmailSubscribe = async () => {
    if (!email || !email.includes("@")) {
      setSubscribeMessage("Please enter a valid email address");
      return;
    }

    setSubscribing(true);
    setSubscribeMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubscribeMessage("Success! You'll receive notifications for new events.");
        setEmail("");
      } else {
        const data = await response.json();
        setSubscribeMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      setSubscribeMessage("Network error. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <section
      id="get-involved"
      className="relative mx-auto mt-16 md:mt-32 flex max-w-6xl flex-col gap-8 md:gap-12 px-4 md:px-6"
      aria-labelledby="get-involved-title"
    >
      <div className="space-y-4 text-center">
        <h2 id="get-involved-title" className="font-display text-4xl text-glow">
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
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10">
              <img src="/discord-icon-svgrepo-com.svg" alt="Discord" className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h3 className="font-display text-lg text-foreground">Discord Community</h3>
              <p className="text-sm text-muted-foreground">
                Join our Discord for real-time event updates, member discussions, and announcements.
              </p>
              <Button variant="ghost" className="mt-3 gap-2 text-xs uppercase tracking-[0.24em]" asChild>
                <a href="https://discord.gg/9gZKmd8b" target="_blank" rel="noreferrer">
                  Join Discord
                </a>
              </Button>
            </div>
          </div>
          <div className="glass-panel no-blur-on-mobile flex items-center gap-4 rounded-3xl border border-white/10 p-6">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10 text-accent">
              <Mail className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h3 className="font-display text-lg text-foreground">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Subscribe for email notifications about new events, workshops, and exclusive updates.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-2 text-xs uppercase tracking-[0.24em]"
                  onClick={handleEmailSubscribe}
                  disabled={subscribing}
                >
                  {subscribing ? "..." : "Subscribe"}
                </Button>
              </div>
              {subscribeMessage && (
                <p className={`mt-2 text-xs ${subscribeMessage.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
                  {subscribeMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetInvolvedSection;
