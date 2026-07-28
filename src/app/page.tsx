import { Hero } from "../components/sections/hero";

import { AboutSection } from "../components/sections/AboutSection";
import { Team } from "../components/sections/team";

import { Products } from "../components/sections/products";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <Products/>
      <Team />
    </>
  );
}
