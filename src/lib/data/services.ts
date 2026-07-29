import {
  Code2,
  Smartphone,
  Palette,
  Cloud,
  BrainCircuit,
  Workflow,
  Network,
  Headset,
  type LucideIcon,
} from "lucide-react";

export interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}

export const services: Service[] = [
  {
    icon: Code2,
    title: "Web Development",
    description:
      "High-performance, pixel-perfect web applications engineered for scale, built on modern frameworks and rigorous engineering practice.",
    features: [
      "Next.js & React architecture",
      "Headless CMS & e-commerce",
      "Progressive web apps",
      "Core Web Vitals optimization",
    ],
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description:
      "Native-feeling iOS and Android experiences from a single codebase, shipped fast without compromising on performance or polish.",
    features: [
      "React Native & Flutter",
      "Offline-first architecture",
      "App Store & Play Store launch",
      "Push notifications & analytics",
    ],
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description:
      "Research-driven design systems and interfaces that feel effortless — crafted with the same rigor as the engineering behind them.",
    features: [
      "Product & UX research",
      "Design systems & tokens",
      "Interactive prototyping",
      "Accessibility-first design",
    ],
  },
  {
    icon: Cloud,
    title: "Cloud Solutions",
    description:
      "Resilient, cost-efficient cloud infrastructure across AWS, Azure and GCP — designed to scale with your product, not against it.",
    features: [
      "Cloud architecture & migration",
      "Serverless & containers",
      "Cost optimization audits",
      "Multi-region availability",
    ],
  },
  {
    icon: BrainCircuit,
    title: "AI Solutions",
    description:
      "Applied AI that ships — from LLM-powered products to internal automation, grounded in real data and measurable outcomes.",
    features: [
      "LLM & RAG applications",
      "Custom model fine-tuning",
      "Intelligent automation",
      "AI infrastructure & MLOps",
    ],
  },
  {
    icon: Workflow,
    title: "DevOps",
    description:
      "CI/CD pipelines and observability that let teams ship confidently, multiple times a day, without firefighting production.",
    features: [
      "CI/CD pipeline design",
      "Infrastructure as code",
      "Monitoring & observability",
      "Zero-downtime deployments",
    ],
  },
  {
    icon: Network,
    title: "System Integration",
    description:
      "We connect the systems that run your business — APIs, legacy platforms and third-party tools — into one coherent whole.",
    features: [
      "API design & integration",
      "Legacy system modernization",
      "Data pipeline orchestration",
      "Enterprise middleware",
    ],
  },
  {
    icon: Headset,
    title: "IT Consulting",
    description:
      "Strategic technology guidance from senior engineers who've shipped at scale — helping you make the right calls, early.",
    features: [
      "Technical due diligence",
      "Architecture review",
      "Technology roadmapping",
      "Team augmentation",
    ],
  },
];
