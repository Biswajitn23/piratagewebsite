export type EventStatus = "upcoming" | "ongoing" | "past";

export type EventSpeaker = {
  name: string;
  role: string;
  avatar: string;
};

export type EventRecord = {
  id: string;
  title: string;
  date: string;
  type: string;
  status: EventStatus;
  coverImage: string;
  gallery: string[];
  description: string;
  speakers: EventSpeaker[];
  registrationLink: string;
  slug: string;
  highlightScene?: string;
};

export type MemberRole = "Exec" | "Mentor" | "DevSecOps" | "Research" | "Outreach";

export type MemberRecord = {
  id: string;
  name: string;
  position: string;
  bio: string;
  roles: MemberRole[];
  avatar3D?: string;
  avatarImage: string;
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  notable: string;
};

export type AchievementRecord = {
  id: string;
  title: string;
  type: string;
  date: string;
  description: string;
  media: string;
};

export type ProjectRecord = {
  id: string;
  title: string;
  summary: string;
  liveDemo?: string;
  repository?: string;
  thumbnail3D?: string;
  technologies: string[];
  highlight: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  media: string;
  orientation: "landscape" | "portrait" | "square";
  description: string;
};

// Intentionally empty — events are expected to be served by the API (Supabase/Firestore).
// When you add events in Supabase they will appear in the Events radar via `/api/events`.
export const events: EventRecord[] = [];

export const members: MemberRecord[] = [
  {
    id: "a-student",
    name: "A. Student",
    position: "President",
    bio: "Blueprints the campus defense strategy and leads cross-squad briefings.",
    roles: ["Exec", "Mentor"],
    avatar3D: undefined,
    avatarImage:
      "https://images.unsplash.com/photo-1507120410856-1f35574c3b45?auto=format&fit=crop&w=400&q=80",
    social: {
      github: "https://github.com/astudent",
      linkedin: "https://linkedin.com/in/astudent",
    },
    notable: "Architected the 2024 campus threat simulation",
  },
  {
    id: "r-signal",
    name: "R. Signal",
    position: "DevSecOps Engineer",
    bio: "Keeps our pipelines hardened and automates zero-dwell detection.",
    roles: ["DevSecOps"],
    avatarImage:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    social: {
      github: "https://github.com/rsignal",
      twitter: "https://twitter.com/rsignal",
    },
    notable: "Published the campus dependency audit playbook",
  },
  {
    id: "k-mentor",
    name: "K. Mentor",
    position: "Blue Team Lead",
    bio: "Runs weekly incident response drills and trains new analysts.",
    roles: ["Mentor", "Research"],
    avatarImage:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80",
    social: {
      linkedin: "https://linkedin.com/in/kmentor",
    },
    notable: "Led the 2024 phishing takedown simulation",
  },
  {
    id: "n-outreach",
    name: "N. Outreach",
    position: "Community Hacker",
    bio: "Hosts high school capture-the-flag camps and workshops.",
    roles: ["Outreach", "Mentor"],
    avatarImage:
      "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=400&q=80",
    social: {
      twitter: "https://twitter.com/noutreach",
    },
    notable: "Launched campus bug bounty education track",
  },
];

export const achievements: AchievementRecord[] = [
  {
    id: "ctf-champions-2024",
    title: "CTF Champions 2024",
    type: "award",
    date: "2024-08-01",
    description: "Ranked 1st in the national intercollegiate cyber defense invitational.",
    media:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "incident-response-whitepaper",
    title: "Incident Response Whitepaper",
    type: "writeup",
    date: "2024-03-11",
    description: "Published 48-hour response blueprint for campus-wide zero-day handling.",
    media:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "secure-campus-audit",
    title: "Secure Campus Audit",
    type: "badge",
    date: "2025-01-02",
    description: "Completed full campus vulnerability sweep with 37 remediations in 10 days.",
    media:
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80",
  },
];

export const projects: ProjectRecord[] = [
  {
    id: "guardian-scan",
    title: "Guardian Scan",
    summary:
      "Automated visibility layer that instruments campus infrastructure with anomaly detection and real-time alerts.",
    liveDemo: "https://pirtatage.club/projects/guardian-scan",
    repository: "https://github.com/pirtatage/guardian-scan",
    technologies: ["Rust", "PostgreSQL", "Grafana"],
    highlight:
      "Reduced incident response time by 64% and caught 12 credential stuffing attacks in testing.",
    thumbnail3D: "https://prod.spline.design/keKXRPFBVvxWUyri/scene.splinecode",
  },
  {
    id: "phantom-fish",
    title: "PhantomFish Simulator",
    summary:
      "Interactive sandbox that demonstrates phishing vectors safely using a guided narrative and live code examples.",
    repository: "https://github.com/pirtatage/phantom-fish",
    technologies: ["React", "Node.js", "Three.js"],
    highlight:
      "Used in outreach sessions to train 400+ new defenders.",
    thumbnail3D: "https://prod.spline.design/7b8QYxQ0QtdN6mN3/scene.splinecode",
  },
  {
    id: "pulse-beacon",
    title: "Pulse Beacon",
    summary:
      "Live campus CTF ticker that aggregates scoreboard APIs into a holographic display and Discord bot feed.",
    liveDemo: "https://pirtatage.club/projects/pulse-beacon",
    technologies: ["TypeScript", "Cloudflare Workers", "Redis"],
    highlight:
      "Displayed across campus commons with 99.99% uptime.",
    thumbnail3D: "https://prod.spline.design/IHc0EK5pCk8tvaAL/scene.splinecode",
  },
];

export const gallery: GalleryItem[] = [
  {
    id: "gallery-ctf",
    title: "CTF Control Center",
    category: "Events",
    media:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    orientation: "landscape",
    description: "Blue team parsing packets during Campus Scan CTF.",
  },
  {
    id: "gallery-workshop",
    title: "Zero Day Lab",
    category: "Workshops",
    media:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1600&q=80",
    orientation: "landscape",
    description: "Students reverse-engineering in the neon lab.",
  },
  {
    id: "gallery-retreat",
    title: "Guardian Retreat",
    category: "Community",
    media:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80",
    orientation: "portrait",
    description: "Mentor retreat brainstorming next-year defenses.",
  },
  {
    id: "gallery-mentors",
    title: "Mentor Council",
    category: "Leadership",
    media:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
    orientation: "landscape",
    description: "Exec team finalizing the audit strike plan.",
  },
];
