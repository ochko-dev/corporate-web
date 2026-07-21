export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Odin didn't just build what we asked for — they challenged our assumptions and delivered something better than the brief. Our conversion rate jumped 34% within a month of launch.",
    name: "Rachel Kim",
    role: "VP of Product",
    company: "Fintra",
    initials: "RK",
    rating: 5,
  },
  {
    quote:
      "The level of communication was unlike any agency we've worked with. Weekly demos, honest timelines, zero surprises. It felt like an in-house team, not a vendor.",
    name: "Tomás Rivera",
    role: "CEO",
    company: "Northloop",
    initials: "TR",
    rating: 5,
  },
  {
    quote:
      "They rebuilt our infrastructure from the ground up and cut our AWS bill by 40% while doubling throughput. That's the kind of ROI that gets noticed in the boardroom.",
    name: "Amelia Foster",
    role: "Head of Engineering",
    company: "Cargofy",
    initials: "AF",
    rating: 5,
  },
  {
    quote:
      "Our AI copilot went from prototype to production in eight weeks. The team's grasp of both the ML and the product side was rare to find in one place.",
    name: "Daniel Osei",
    role: "Founder",
    company: "Vantix",
    initials: "DO",
    rating: 5,
  },
  {
    quote:
      "Design quality that genuinely competes with the best product teams in the world. Our users noticed immediately, and so did our investors.",
    name: "Nina Petrova",
    role: "CPO",
    company: "Ledgerly",
    initials: "NP",
    rating: 5,
  },
];
