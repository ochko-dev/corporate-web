export interface PricingTier {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$4,900",
    cadence: "/ month",
    description:
      "For early-stage teams that need a senior partner to ship an MVP fast.",
    features: [
      "1 dedicated product engineer",
      "Web or mobile application",
      "Weekly progress demos",
      "Basic CI/CD pipeline",
      "Slack & email support",
    ],
    cta: "Get started",
  },
  {
    name: "Professional",
    price: "$12,500",
    cadence: "/ month",
    description:
      "For growing companies building and scaling a core product line.",
    features: [
      "Full cross-functional pod",
      "Web, mobile & backend coverage",
      "Dedicated design partner",
      "Cloud architecture & DevOps",
      "Priority Slack support",
      "Bi-weekly strategy reviews",
    ],
    highlighted: true,
    cta: "Book a call",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "tailored scope",
    description:
      "For organizations with complex, multi-team engineering programs.",
    features: [
      "Multiple dedicated pods",
      "AI & data engineering",
      "Enterprise security review",
      "24/7 SLA-backed support",
      "Dedicated engagement lead",
      "Custom reporting & governance",
    ],
    cta: "Contact sales",
  },
];
