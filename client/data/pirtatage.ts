export type EventStatus = "upcoming" | "past";

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

export const events: EventRecord[] = [
  {
    id: "intro-ethical-hacking",
    title: "Intro to Ethical Hacking",
    date: "2025-11-15T18:00:00Z",
    type: "Workshop",
    status: "upcoming",
    coverImage:
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
    ],
    description:
      "Kickstart your ethical hacking journey with reconnaissance, threat modeling, and live exploit walkthroughs. Laptop required.",
    speakers: [
      {
        name: "A. Student",
        role: "President",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      },
      {
        name: "M. Analyst",
        role: "Blue Team Lead",
        avatar:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
      },
    ],
    registrationLink: "https://pirtatage.club/register/intro",
    slug: "intro-to-ethical-hacking",
    highlightScene: "https://prod.spline.design/Rxs2iYlN9z5tf5ia/scene.splinecode",
  },
  {
    id: "campus-scan-ctf",
    title: "Campus Scan CTF",
    date: "2025-03-09T17:00:00Z",
    type: "Capture The Flag",
    status: "upcoming",
    coverImage:
      "https://images.unsplash.com/photo-1526378722484-cc5c5100ca52?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
    ],
    description:
      "48-hour campus-wide CTF with network forensics, binary exploitation, and hardware badge hacking challenges.",
    speakers: [
      {
        name: "C. Defender",
        role: "CTF Lead",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      },
    ],
    registrationLink: "https://pirtatage.club/register/ctf",
    slug: "campus-scan-ctf",
    highlightScene: "https://prod.spline.design/J0O8P0VvSshz6Rlr/scene.splinecode",
  },
  {
    id: "purple-team-retrospective",
    title: "Purple Team Retrospective",
    date: "2024-11-21T22:00:00Z",
    type: "Research",
    status: "past",
    coverImage:
      "https://images.unsplash.com/photo-1535229391455-0f82f16e8f3c?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1580894906472-0f83c2d067ff?auto=format&fit=crop&w=1600&q=80",
    ],
    description:
      "Breakdown of university-wide red/blue collaboration, with live demos of patched vulnerabilities and doc releases.",
    speakers: [
      {
        name: "J. Archivist",
        role: "Research Coordinator",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      },
    ],
    registrationLink: "https://pirtatage.club/events/purple-retro",
    slug: "purple-team-retrospective",
    highlightScene: "https://prod.spline.design/0rnGDFw7tns1yYCA/scene.splinecode",
  },
];

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
