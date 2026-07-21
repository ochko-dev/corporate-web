import {
  Atom,
  Triangle,
  Server,
  Component,
  Terminal,
  Container,
  Ship,
  Database,
  Leaf,
  CloudCog,
  CloudLightning,
  Cloud,
  Feather,
  Smartphone,
  FileCode,
  type LucideIcon,
} from "lucide-react";

export interface Technology {
  name: string;
  icon: LucideIcon;
  category: "Frontend" | "Backend" | "Infra" | "Data" | "Mobile" | "Language";
}

export const technologies: Technology[] = [
  { name: "React", icon: Atom, category: "Frontend" },
  { name: "Next.js", icon: Triangle, category: "Frontend" },
  { name: "Node.js", icon: Server, category: "Backend" },
  { name: "NestJS", icon: Component, category: "Backend" },
  { name: "Python", icon: Terminal, category: "Language" },
  { name: "Docker", icon: Container, category: "Infra" },
  { name: "Kubernetes", icon: Ship, category: "Infra" },
  { name: "PostgreSQL", icon: Database, category: "Data" },
  { name: "MongoDB", icon: Leaf, category: "Data" },
  { name: "AWS", icon: CloudCog, category: "Infra" },
  { name: "Azure", icon: CloudLightning, category: "Infra" },
  { name: "GCP", icon: Cloud, category: "Infra" },
  { name: "Flutter", icon: Feather, category: "Mobile" },
  { name: "React Native", icon: Smartphone, category: "Mobile" },
  { name: "TypeScript", icon: FileCode, category: "Language" },
];
