import { Hero } from "../components/sections/heroSection";

import { AboutSection } from "../components/sections/AboutSection";

import { Products } from "../components/sections/productSection";
import { TeamSection } from "../components/team/TeamSection";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <Products/>
      <TeamSection />
    </>
  );
}
