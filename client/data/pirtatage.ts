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
  location?: string;
  venue?: string;
};

export type MemberRole = "Leadership" | "Events" | "Technical" | "Design" | "Operations";

export type MemberRecord = {
  id: string;
  name: string;
  position: string;
  roles: MemberRole[];
  avatar3D?: string;
  avatarImage: string;
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
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
    id: "nitin-singh",
    name: "Nitin Singh",
    position: "President",
    roles: ["Leadership"],
    avatarImage: "/nitin.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/nitin-singh-731793275?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      instagram: "https://www.instagram.com/singh.nitin01/",
    },
    notable: "",
  },
  {
    id: "biswajit-nayak",
    name: "Biswajit Nayak",
    position: "Vice President",
    roles: ["Leadership"],
    avatarImage: "/biswajit.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/biswajit-nayak-9a0b97321",
      instagram: "https://www.instagram.com/biswajitgotnochill/",
    },
    notable: "",
  },
  {
    id: "naman-kumar",
    name: "Naman Kumar",
    position: "Secretary",
    roles: ["Leadership"],
    avatarImage: "/naman.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/naman-kumar-4ba6b3327?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      instagram: "https://www.instagram.com/_naman_kashyap24/",
    },
    notable: "",
  },
  {
    id: "yuti-sasane",
    name: "Yuti Sasane",
    position: "Joint Secretary",
    roles: ["Leadership"],
    avatarImage: "/yuti.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/yuti-sasane-54420a340?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      instagram: "https://www.instagram.com/softmess.yuti?igsh=eHE5NTV5azN1dWsy",
    },
    notable: "",
  },
  {
    id: "manisha-biswal",
    name: "Manisha Biswal",
    position: "Event Head",
    roles: ["Events"],
    avatarImage: "/manisha.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/manisha-biswal-7076b3325?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      instagram: "http://instagram.com/_manishaa14_/",
    },
    notable: "",
  },
  {
    id: "ashutosh-sahu",
    name: "Ashutosh Sahu",
    position: "Event Coordinator",
    roles: ["Events"],
    avatarImage: "/ashutosh.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/ashutoshsahu-",
      instagram: "https://www.instagram.com/_ashutosh.__.sahu_/",
    },
    notable: "",
  },
  {
    id: "komal-meghani",
    name: "Komal Meghani",
    position: "Event Coordinator",
    roles: ["Events"],
    avatarImage: "/komal.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/komal-meghani-ab14a2327/",
      instagram: "https://www.instagram.com/komalmeghani_/",
    },
    notable: "",
  },
  {
    id: "gourav-behera",
    name: "Gourav Kumar Behera",
    position: "Programming Lead",
    roles: ["Technical"],
    avatarImage: "/gourav.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/gourav-kumar-behera",
      instagram: "https://www.instagram.com/gouravkbehera/",
    },
    notable: "",
  },
  {
    id: "ujjawal-singh",
    name: "Ujjawal Singh",
    position: "Programming Expert",
    roles: ["Technical"],
    avatarImage: "/ujjawal.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/ujjawal-singh-6a166a32a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      instagram: "https://www.instagram.com/rathorujjwalsingh/",
    },
    notable: "",
  },
  {
    id: "aditya-chourasia",
    name: "Aditya Chourasia",
    position: "DBMS Lead",
    roles: ["Technical"],
    avatarImage: "/aditya.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/aditya-chourasia-5a4893327?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      instagram: "https://www.instagram.com/_aadi_chourasia/",
    },
    notable: "",
  },
  {
    id: "shraddha-sahu",
    name: "Shraddha Sahu",
    position: "DBMS Expert",
    roles: ["Technical"],
    avatarImage: "/shraddha.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/shraddha-sahu-219bb3353/",
      instagram: "",
    },
    notable: "",
  },
  {
    id: "yash",
    name: "Yash Bhikhwani",
    position: "Networking Lead",
    roles: ["Technical"],
    avatarImage: "/yash.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/yash-bhikhwani-957200330/",
      instagram: "",
    },
    notable: "",
  },
  {
    id: "swati-agrawal",
    name: "Swati Agrawal",
    position: "Networking Expert",
    roles: ["Technical"],
    avatarImage: "/swati.jpeg",
    social: {
      linkedin: "",
      instagram: "",
    },
    notable: "",
  },
  {
    id: "yogesh-wathe",
    name: "Yogesh Sunil Wathe",
    position: "Malware Analyst",
    roles: ["Technical"],
    avatarImage: "/yogesh.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/yogesh-wathe-b06546325?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      instagram: "https://www.instagram.com/yogesh_wate/",
    },
    notable: "",
  },
  {
    id: "nibedita-patel",
    name: "Nibedita Patel",
    position: "Cryptography Lead",
    roles: ["Technical"],
    avatarImage: "/nibedita.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/nibedita-patel-57863532b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      instagram: "",
    },
    notable: "",
  },
  {
    id: "kartik-shreekumar",
    name: "Kartik Shreekumar",
    position: "Cryptography Expert",
    roles: ["Technical"],
    avatarImage: "/kartik.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/kartik-shreekumar-1a4831245?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      instagram: "http://instagram.com/kartikvortex/",
    },
    notable: "",
  },
  {
    id: "athrav-singh",
    name: "Athrav Pratap Singh",
    position: "UI/UX Lead",
    roles: ["Design"],
    avatarImage: "/athrav.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/atharv-pratap-singh-a787a4320/",
      instagram: "https://www.instagram.com/athar_v019/",
    },
    notable: "",
  },
  {
    id: "rupendra-kumar-sahu",
    name: "Rupendra Kumar Sahu",
    position: "UI/UX Expert",
    roles: ["Design"],
    avatarImage: "/rupendra.webp",
    social: {
      linkedin: "",
      instagram: "",
    },
    notable: "",
  },
  {
    id: "tushar-shendey",
    name: "Tushar Shendey",
    position: "Graphic Designer",
    roles: ["Design"],
    avatarImage: "/tushar.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/tushar-shendey-099a7334a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      instagram: "https://www.instagram.com/tusharr.30_/",
    },
    notable: "",
  },
  {
    id: "anshu",
    name: "Anshu",
    position: "Management",
    roles: ["Operations"],
    avatarImage: "/anshu.webp",
    social: {
      linkedin: "",
      instagram: "",
    },
    notable: "",
   },
  {
    id: "shruti-kumari",
    name: "Shruti Kumari",
    position: "Management",
    roles: ["Operations"],
    avatarImage: "/shruti.webp",
    social: {
      linkedin: "",
      instagram: "https://www.instagram.com/shruti22285/",
    },
    notable: "",
  },
  {
    id: "jiya-dhand",
    name: "Jiya Dhand",
    position: "Content Writer",
    roles: ["Operations"],
    avatarImage: "/jiya.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/jiya-dhand-a25162398/",
      instagram: "https://www.instagram.com/jiyaaaaaaaaa_____29/",
    },
    notable: "",
  },
  {
    id: "anushka-choudhary",
    name: "Anushka Choudhary",
    position: "Content Writer",
    roles: ["Operations"],
    avatarImage: "/anushka.webp",
    social: {
      linkedin: "",
      instagram: "https://www.instagram.com/anushkachy__/",
    },
    notable: "",
  },
  {
    id: "sakshi-bhatt",
    name: "Sakshi Bhatt",
    position: "Public Relations Lead",
    roles: ["Operations"],
    avatarImage: "/sakshi.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/sakshi-bhatt-461801272/",
      instagram: "https://www.instagram.com/bhattsakshi2709/",
    },
    notable: "",
  },
  {
    id: "shreya-barde",
    name: "Shreya Barde",
    position: "Public Relations Expert",
    roles: ["Operations"],
    avatarImage: "/shreya.webp",
    social: {
      linkedin: "https://www.linkedin.com/in/shreya-barde-4a7465385?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      instagram: "https://www.instagram.com/shreyabarde_/",
    },
    notable: "",
  },
];

export const achievements: AchievementRecord[] = [
  {
    id: "ctf-champions-2024",
    title: "Hackathon Champions 2024",
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
      "Live campus Hackathon ticker that aggregates scoreboard APIs into a holographic display and Discord bot feed.",
    liveDemo: "https://pirtatage.club/projects/pulse-beacon",
    technologies: ["TypeScript", "Cloudflare Workers", "Redis"],
    highlight:
      "Displayed across campus commons with 99.99% uptime.",
    thumbnail3D: "https://prod.spline.design/IHc0EK5pCk8tvaAL/scene.splinecode",
  },
];

// Gallery is served by the API when Supabase is configured. Keep this empty so the
// frontend will request `/api/gallery` and show stored images from Supabase Storage.
export const gallery: GalleryItem[] = [];
