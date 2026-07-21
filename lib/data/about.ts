import {
  Target,
  Eye,
  HeartHandshake,
  ShieldCheck,
  Lightbulb,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

export const stats: Stat[] = [
  { label: "Projects delivered", value: 240, suffix: "+" },
  { label: "Years in business", value: 11, suffix: "+" },
  { label: "Engineers & designers", value: 68, suffix: "+" },
  { label: "Client retention", value: 96, suffix: "%" },
];

export interface CoreValue {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const coreValues: CoreValue[] = [
  {
    icon: ShieldCheck,
    title: "Craftsmanship",
    description:
      "We sweat the details others skip — from animation easing to database indexes. Quality is not a phase, it's the default.",
  },
  {
    icon: HeartHandshake,
    title: "Partnership",
    description:
      "We embed with your team, not beside it. Your goals, deadlines and constraints become ours from day one.",
  },
  {
    icon: Lightbulb,
    title: "Curiosity",
    description:
      "We stay ahead of the stack so you don't have to — evaluating new tools critically, adopting what actually moves the needle.",
  },
  {
    icon: Users,
    title: "Ownership",
    description:
      "Every engineer on your project thinks like a founder — accountable for outcomes, not just tickets closed.",
  },
];

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

export const timeline: TimelineItem[] = [
  {
    year: "2014",
    title: "Founded in a small studio",
    description:
      "Odin started as a three-person team building websites for local businesses — with an obsession for craft from day one.",
  },
  {
    year: "2017",
    title: "First enterprise engagement",
    description:
      "Landed our first Fortune 500 client, scaling the team to 15 engineers to deliver a multi-region commerce platform.",
  },
  {
    year: "2019",
    title: "Cloud & DevOps practice launched",
    description:
      "Built a dedicated infrastructure team to help clients modernize legacy systems and adopt cloud-native architecture.",
  },
  {
    year: "2021",
    title: "Mobile studio opens",
    description:
      "Expanded into native and cross-platform mobile development, shipping apps used by millions of people worldwide.",
  },
  {
    year: "2023",
    title: "AI & Data division",
    description:
      "Formed a specialized team applying LLMs and machine learning to real production problems for clients across industries.",
  },
  {
    year: "2025",
    title: "240+ products shipped",
    description:
      "Today, Odin is a 68-person studio trusted by startups and enterprises alike to build ambitious software end to end.",
  },
];

export interface WhyItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const whyChooseUs: WhyItem[] = [
  {
    icon: Target,
    title: "Outcome-driven",
    description: "We measure success by your metrics, not story points.",
  },
  {
    icon: Eye,
    title: "Radical transparency",
    description: "Weekly demos, open roadmaps, no black boxes.",
  },
  {
    icon: ShieldCheck,
    title: "Senior-only teams",
    description: "No juniors learning on your budget — ever.",
  },
];
