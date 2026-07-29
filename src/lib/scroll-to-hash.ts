import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

/**
 * Animates the page to an in-page anchor via GSAP instead of the browser's
 * native fragment jump. Hero/About/Products pin their own section, and
 * GSAP's transform-based pinning leaves a permanent compensating transform
 * on the pinned element even after its scroll range is fully passed (by
 * design, so it doesn't visually jump once scrolled past) — which means
 * `getBoundingClientRect()` on that element is offset by the pin's travel
 * distance forever, not just while pinned. A native `<a href="#id">` jump
 * (or any live rect measurement) targets that corrupted position and stops
 * short exactly at the pin's own end boundary. `products.tsx`'s
 * `handleSelect` already works around this the same way: read the
 * ScrollTrigger's cached `.start`, which is measured correctly once up
 * front and immune to the residual transform. Returns whether it found a
 * target to scroll to, so callers only suppress the default anchor jump
 * when this took over.
 */
export function scrollToHash(hash: string) {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  const target = document.getElementById(id);
  if (!target) return false;

  const pinTrigger = ScrollTrigger.getAll().find((st) => st.trigger === target && st.pin);
  const targetY = pinTrigger ? pinTrigger.start : target.getBoundingClientRect().top + window.scrollY;

  gsap.to(window, {
    duration: 1,
    ease: "power2.inOut",
    scrollTo: { y: targetY, autoKill: true },
  });
  return true;
}
