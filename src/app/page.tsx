import { HeroSection } from "../components/sections/heroSection";

import { AboutSection } from "../components/sections/AboutSection";

import { ProductSection } from "../components/sections/productSection";
import { TeamSection } from "../components/sections/TeamSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProductSection />
      <TeamSection />
    </>
  );
}
