export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: "What industries do you typically work with?",
    answer:
      "We work across fintech, healthtech, logistics, retail and B2B SaaS most frequently, but our process adapts well to any domain with a clear product goal and technical constraints.",
  },
  {
    question: "How quickly can a project start?",
    answer:
      "Most engagements kick off within 1-2 weeks of signing. For urgent needs, we can often assemble a starter pod within 3-5 business days.",
  },
  {
    question: "Do you work with in-house engineering teams?",
    answer:
      "Yes — a large share of our engagements are augmentation-style, embedding one or more of our engineers directly into your existing team and workflows.",
  },
  {
    question: "What does your pricing actually include?",
    answer:
      "Every tier includes senior engineering and design time, project management, QA, and infrastructure setup. There are no hidden fees for code reviews, documentation, or standard support.",
  },
  {
    question: "Can you take over an existing codebase?",
    answer:
      "Absolutely. We start every takeover engagement with a structured audit covering architecture, security, performance and technical debt before writing a single line of code.",
  },
  {
    question: "What does the engagement process look like?",
    answer:
      "We follow the seven-stage process outlined above — discovery, planning, design, development, testing, deployment and maintenance — with a demo at the end of every sprint.",
  },
  {
    question: "Do you sign NDAs and offer IP protection?",
    answer:
      "Yes, we sign mutual NDAs before any discovery call and all IP produced during the engagement is fully owned by you from day one.",
  },
];
