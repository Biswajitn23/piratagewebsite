import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Compass, Gamepad2, Loader2, Sparkles } from "lucide-react";

const tracks = [
  "Workshops",
  "Capture The Flag",
  "Security Audits",
  "Research",
  "Outreach",
];

const skillLevels = [
  { value: "novice", label: "Novice (eager to learn)" },
  { value: "scout", label: "Scout (some experience)" },
  { value: "sentry", label: "Sentry (I mentor peers)" },
  { value: "guardian", label: "Guardian (lead experiences)" },
];

export type JoinCrewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const JoinCrewDialog = ({ open, onOpenChange }: JoinCrewDialogProps) => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    track: "",
    skill: "novice",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const noviceBadge = useMemo(
    () => ({
      label: "Novice Guardian",
      description: "Unlocked for stepping into the arena",
    }),
    [],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.name || !formState.email) {
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSubmitted(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pirtatage:join-submitted", {
            detail: {
              email: formState.email,
              track: formState.track,
              skill: formState.skill,
            },
          }),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setFormState({ name: "", email: "", track: "", skill: "novice", message: "" });
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setTimeout(() => {
        reset();
      }, 300);
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-panel max-w-3xl border border-white/10 bg-[#060218]/90 p-0 text-foreground">
        <div className="relative overflow-hidden rounded-[30px]">
          <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-neon-purple/30 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 left-6 h-72 w-72 rounded-full bg-neon-teal/20 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-12 px-10 py-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="font-display text-3xl text-glow">
                  Join the Piratage Crew
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Tell us how you love to hack (ethically) and we will reach out
                  with missions tailored to your curiosity.
                </DialogDescription>
              </DialogHeader>
              {submitted ? (
                <motion.div
                  className="mt-8 space-y-6 rounded-3xl border border-neon-teal/30 bg-neon-teal/10 p-6 text-neon-teal"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 text-neon-teal">
                    <CheckCircle2 className="h-6 w-6" />
                    <h3 className="font-display text-2xl">Transmission Received</h3>
                  </div>
                  <p className="text-sm text-foreground/80">
                    Welcome aboard! Expect a welcome packet in your inbox with
                    onboarding missions and access to the Hall of Guardians.
                  </p>
                  <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-accent">
                    <p className="text-xs uppercase tracking-[0.3em]">
                      Badge Unlocked
                    </p>
                    <h4 className="mt-2 font-display text-xl text-foreground">
                      {noviceBadge.label}
                    </h4>
                    <p className="text-sm text-foreground/80">
                      {noviceBadge.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="rounded-full border border-white/10 bg-white/5 text-sm text-foreground"
                    onClick={reset}
                  >
                    Submit another
                  </Button>
                </motion.div>
              ) : (
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Name" htmlFor="join-name">
                      <Input
                        id="join-name"
                        name="name"
                        required
                        value={formState.name}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Your legendary alias"
                      />
                    </Field>
                    <Field label="Email" htmlFor="join-email">
                      <Input
                        id="join-email"
                        name="email"
                        type="email"
                        required
                        value={formState.email}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                        placeholder="you@university.edu"
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Primary Curiosity" htmlFor="join-track">
                      <Select
                        value={formState.track}
                        onValueChange={(value) =>
                          setFormState((prev) => ({
                            ...prev,
                            track: value,
                          }))
                        }
                      >
                        <SelectTrigger id="join-track">
                          <SelectValue placeholder="Pick your arena" />
                        </SelectTrigger>
                        <SelectContent>
                          {tracks.map((track) => (
                            <SelectItem key={track} value={track}>
                              {track}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Skill Signal" htmlFor="join-skill">
                      <Select
                        value={formState.skill}
                        onValueChange={(value) =>
                          setFormState((prev) => ({
                            ...prev,
                            skill: value,
                          }))
                        }
                      >
                        <SelectTrigger id="join-skill">
                          <SelectValue placeholder="Your level" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field
                    label="Why are you here to defend?"
                    htmlFor="join-message"
                    description="Signals you send help us squad you into missions."
                  >
                    <Textarea
                      id="join-message"
                      name="message"
                      value={formState.message}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          message: event.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="I love tearing apart malware, mentoring new hackers, and building resilient systems..."
                    />
                  </Field>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    <span className="inline-flex items-center gap-2 text-neon-teal">
                      <Gamepad2 className="h-4 w-4" /> Earn the novice badge on submit
                    </span>
                    <Badge variant="secondary" className="border-neon-purple/40 bg-neon-purple/10 text-neon-purple">
                      Instant invite + updates
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="tilt-hover rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-8 py-6 text-base font-semibold text-primary-foreground shadow-glow"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Encrypting Request
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5" /> Send Application
                        </span>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      We respond within 48 hours. Data is encrypted at rest.
                    </p>
                  </div>
                </form>
              )}
            </div>
            <aside className="space-y-8">
              <div className="rounded-3xl border border-neon-purple/40 bg-neon-purple/10 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-neon-purple/80">
                  Why join?
                </p>
                <ul className="mt-4 space-y-3 text-sm text-foreground/80">
                  <li className="tilt-hover rounded-2xl border border-white/10 bg-white/5 p-3">
                    Embedded mentorship pods with security engineers.
                  </li>
                  <li className="tilt-hover rounded-2xl border border-white/10 bg-white/5 p-3">
                    Access to private Hackathon practice ranges and tooling.
                  </li>
                  <li className="tilt-hover rounded-2xl border border-white/10 bg-white/5 p-3">
                    Exclusive alerts on campus vuln-bounty missions.
                  </li>
                </ul>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
                  <Compass className="h-4 w-4 text-neon-teal" /> Next Steps
                </p>
                <ol className="mt-4 list-decimal space-y-2 pl-6 text-foreground/80">
                  <li>Receive onboarding mission brief &amp; Discord invite.</li>
                  <li>Pick your squad: Red (offense), Blue (defense), or Violet (research).</li>
                  <li>Ship your first write-up within 30 days for Guardian consideration.</li>
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

type FieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  description?: string;
};

const Field = ({ label, htmlFor, children, description }: FieldProps) => (
  <div className="flex flex-col gap-2">
    <Label
      htmlFor={htmlFor}
      className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
    >
      {label}
    </Label>
    {children}
    {description ? (
      <p className="text-[11px] text-muted-foreground/70">{description}</p>
    ) : null}
  </div>
);

export default JoinCrewDialog;
