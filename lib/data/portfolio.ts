export interface Project {
  id: string;
  title: string;
  category: "Web" | "Mobile" | "AI" | "Cloud";
  description: string;
  tech: string[];
  gradient: string;
  liveUrl?: string;
  githubUrl?: string;
}

export const projectCategories: Project["category"][] = [
  "Web",
  "Mobile",
  "AI",
  "Cloud",
];

export const projects: Project[] = [
  {
    id: "aurora-commerce",
    title: "Aurora Commerce",
    category: "Web",
    description:
      "A headless commerce platform handling 40k orders/day with sub-second page loads across 12 storefronts.",
    tech: ["Next.js", "TypeScript", "PostgreSQL"],
    gradient: "from-brand-indigo/80 to-brand-violet/60",
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: "pulse-health",
    title: "Pulse Health",
    category: "Mobile",
    description:
      "A telehealth companion app connecting patients with specialists in real time, built for iOS and Android.",
    tech: ["React Native", "Node.js", "WebRTC"],
    gradient: "from-brand-cyan/70 to-brand-indigo/60",
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: "synth-copilot",
    title: "Synth Copilot",
    category: "AI",
    description:
      "An LLM-powered assistant that automates support triage, cutting first-response time by 78% for a SaaS client.",
    tech: ["Python", "RAG", "AWS"],
    gradient: "from-brand-violet/80 to-brand-pink/50",
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: "nimbus-infra",
    title: "Nimbus Infra",
    category: "Cloud",
    description:
      "A multi-region infrastructure migration reducing cloud spend by 43% while improving uptime to 99.99%.",
    tech: ["Kubernetes", "Terraform", "GCP"],
    gradient: "from-brand-cyan/60 to-brand-violet/50",
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: "ledger-flow",
    title: "Ledger Flow",
    category: "Web",
    description:
      "A real-time financial dashboard for a fintech scale-up, processing millions of transactions with live analytics.",
    tech: ["React", "NestJS", "MongoDB"],
    gradient: "from-brand-indigo/70 to-brand-cyan/50",
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: "voyage-app",
    title: "Voyage",
    category: "Mobile",
    description:
      "A travel-planning app with offline maps and collaborative itineraries, downloaded 500k+ times.",
    tech: ["Flutter", "Firebase", "Node.js"],
    gradient: "from-brand-pink/60 to-brand-violet/50",
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: "quanta-analytics",
    title: "Quanta Analytics",
    category: "AI",
    description:
      "A predictive analytics engine forecasting demand for a retail chain across 300+ locations.",
    tech: ["Python", "PyTorch", "Docker"],
    gradient: "from-brand-violet/70 to-brand-cyan/60",
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    id: "atlas-devops",
    title: "Atlas Platform",
    category: "Cloud",
    description:
      "An internal developer platform giving 40+ engineering teams self-service infrastructure provisioning.",
    tech: ["Kubernetes", "AWS", "Go"],
    gradient: "from-brand-indigo/70 to-brand-pink/50",
    liveUrl: "#",
    githubUrl: "#",
  },
];
