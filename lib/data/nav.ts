export interface NavLink {
  /** Key under the `nav` namespace in messages/*.json */
  key: "about" | "products" | "team" | "contact";
  href: string;
}

export const navLinks: NavLink[] = [
  { key: "about", href: "#about" },
  { key: "products", href: "#products" },
  { key: "team", href: "#team" },
  { key: "contact", href: "#contact" },
];

export const footerNav = {
  company: [
    { label: "About us", href: "#about" },
    { label: "Our team", href: "#team" },
    { label: "Careers", href: "#contact" },
    { label: "Contact", href: "#contact" },
  ],
  services: [
    { label: "Web Development", href: "#services" },
    { label: "Mobile Apps", href: "#services" },
    { label: "UI/UX Design", href: "#services" },
    { label: "Cloud Solutions", href: "#services" },
    { label: "AI Solutions", href: "#services" },
    { label: "DevOps", href: "#services" },
  ],
  resources: [
    { label: "Case studies", href: "#portfolio" },
    { label: "Process", href: "#process" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
};
