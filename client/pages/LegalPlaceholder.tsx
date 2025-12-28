import { useMemo } from "react";
import { Anchor, Binary, ScrollText, Camera, Shield } from "lucide-react";

const copyMap = {
  "code-of-conduct": {
    title: "Code of Conduct",
    subtitle: "(Ethical Hacking Club – College Level)",
    icon: Shield,
    sections: [
      {
        title: "Purpose",
        content: "Our club exists to promote ethical hacking, cybersecurity awareness, and responsible learning. All members are expected to act with integrity, professionalism, and respect for the law."
      },
      {
        title: "1. Ethical Use Only",
        points: [
          "Members must only perform security testing on systems they own or have explicit written permission to test.",
          "Unauthorized hacking, data theft, surveillance, or exploitation is strictly prohibited.",
          "Skills learned in the club must not be used for illegal or malicious activities."
        ]
      },
      {
        title: "2. Legal Compliance",
        points: [
          "All activities must comply with Indian IT laws, university policies, and applicable regulations.",
          "Any activity violating the law or campus rules will result in immediate disciplinary action."
        ]
      },
      {
        title: "3. Authorization & Consent",
        points: [
          "Security testing, audits, and research must be conducted only with prior approval from the system owner.",
          "Verbal consent is not sufficient; documented permission is mandatory."
        ]
      },
      {
        title: "4. Responsible Disclosure",
        points: [
          "Discovered vulnerabilities must be reported responsibly and privately.",
          "Members must not publicly disclose vulnerabilities without permission from the affected organization."
        ]
      },
      {
        title: "5. Respect & Inclusion",
        points: [
          "Harassment, discrimination, or intimidation of any kind is not tolerated.",
          "Members must respect diversity of skill level, background, and opinions."
        ]
      },
      {
        title: "6. Academic Integrity",
        points: [
          "Members must not use club resources to cheat in exams, assignments, or competitions.",
          "Plagiarism and misrepresentation of work are unacceptable."
        ]
      },
      {
        title: "7. Consequences",
        content: "Violation of this Code may lead to:",
        points: [
          "Suspension or removal from the club",
          "Reporting to university authorities",
          "Permanent ban from club activities"
        ]
      },
      {
        title: "8. Acknowledgment",
        content: "By joining or participating in club activities, members agree to abide by this Code of Conduct."
      }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    icon: ScrollText,
    sections: [
      {
        title: "Information Collection",
        content: "This website collects minimal information such as names and contact details submitted voluntarily through forms for club communication and event updates."
      },
      {
        title: "Data Usage & Protection",
        points: [
          "We do not sell, share, or misuse personal data.",
          "Information is used only for official club purposes.",
          "Member names and roles displayed on the website are published with consent."
        ]
      },
    ]
  },
  sponsors: {
    title: "Sponsor Packet",
    description:
      "Sponsoring helps us defend the campus. Request the holographic deck and metrics overview from our partnerships team.",
    icon: Anchor,
  },
} as const;

type LegalPlaceholderProps = {
  type: keyof typeof copyMap;
};

const LegalPlaceholder = ({ type }: LegalPlaceholderProps) => {
  const copy = copyMap[type];
  const Icon = copy?.icon ?? Binary;

  const gradient = useMemo(
    () =>
      "linear-gradient(135deg, rgba(124,77,255,0.25) 0%, rgba(0,255,209,0.22) 50%, rgba(255,204,51,0.18) 100%)",
    [],
  );

  if (!copy) {
    return null;
  }

  // Render pages with detailed sections (Code of Conduct, Privacy Policy, etc.)
  if ("sections" in copy) {
    return (
      <section className="relative mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16 pt-32">
        <div
          className="glass-panel relative flex w-full flex-col gap-8 rounded-3xl border border-white/10 p-8 md:p-12"
          style={{ backgroundImage: gradient }}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full border border-neon-teal/40 bg-neon-teal/10 text-neon-teal">
              <Icon className="h-8 w-8" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-4xl text-glow">{copy.title}</h1>
              {copy.subtitle && (
                <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
              )}
            </div>
          </div>

          <div className="space-y-6 text-left">
            {copy.sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h2 className="font-display text-xl text-foreground">{section.title}</h2>
                {section.content && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                )}
                {section.points && (
                  <ul className="space-y-2 ml-4">
                    {section.points.map((point, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                        <span className="text-neon-teal mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70 text-center">
            Questions? Email <a href="mailto:piratage.auc@gmail.com" className="text-neon-teal hover:underline">piratage.auc@gmail.com</a>
          </p>
        </div>
      </section>
    );
  }

  // Default render for other pages
  return (
    <section className="relative mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center gap-8 px-6 pt-32 text-center">
      <div
        className="glass-panel relative flex w-full flex-col gap-6 rounded-3xl border border-white/10 p-12"
        style={{ backgroundImage: gradient }}
      >
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-neon-teal/40 bg-neon-teal/10 text-neon-teal">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </span>
        <div className="space-y-4">
          <h1 className="font-display text-4xl text-glow">{copy.title}</h1>
          {"description" in copy && (
            <p className="mx-auto max-w-2xl text-base text-muted-foreground">
              {copy.description}
            </p>
          )}
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
          Need the doc immediately? Email piratage.auc@gmail.com
        </p>
      </div>
    </section>
  );
};

export default LegalPlaceholder;
