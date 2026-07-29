import {
  Search,
  ClipboardList,
  PenTool,
  Hammer,
  TestTube2,
  Rocket,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

export interface ProcessStep {
  step: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const processSteps: ProcessStep[] = [
  {
    step: "01",
    icon: Search,
    title: "Discovery",
    description:
      "We dig into your goals, users and constraints to define what success actually looks like before writing a spec.",
  },
  {
    step: "02",
    icon: ClipboardList,
    title: "Planning",
    description:
      "Scope, architecture and milestones are mapped into a roadmap your whole team can see and hold us to.",
  },
  {
    step: "03",
    icon: PenTool,
    title: "Design",
    description:
      "Wireframes evolve into high-fidelity, interactive prototypes validated with real users before development starts.",
  },
  {
    step: "04",
    icon: Hammer,
    title: "Development",
    description:
      "Senior engineers build in focused sprints, with staging environments and demos available from week one.",
  },
  {
    step: "05",
    icon: TestTube2,
    title: "Testing",
    description:
      "Automated and manual QA, performance audits and accessibility checks run continuously, not just before release.",
  },
  {
    step: "06",
    icon: Rocket,
    title: "Deployment",
    description:
      "Zero-downtime releases with rollback plans, monitoring and alerting configured before your users see a thing.",
  },
  {
    step: "07",
    icon: LifeBuoy,
    title: "Maintenance",
    description:
      "We stay on as long as you need us — shipping improvements, watching metrics and keeping the lights on.",
  },
];
