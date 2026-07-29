/** Back-to-front lighting ramp: violet in the far depth, brand deep blue
 *  through the mid volume, brand cyan on the near face. Shared by every
 *  particle scene so the whole page reads as one system. */
export const COLOR_STOPS: [number, number, number][] = [
  [109, 74, 255], // violet (deep back)
  [7, 93, 135], // deep blue — brand #075D87
  [22, 132, 158], // mid transition
  [47, 183, 195], // cyan (front) — brand #2FB7C3
];

export const ACCENT_ORANGE = "rgb(255,127,26)"; // brand #FF7F1A, used sparingly

export function colorAt(t: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (COLOR_STOPS.length - 1);
  const i = Math.min(COLOR_STOPS.length - 2, Math.floor(scaled));
  const localT = scaled - i;
  const [r1, g1, b1] = COLOR_STOPS[i];
  const [r2, g2, b2] = COLOR_STOPS[i + 1];
  return [r1 + (r2 - r1) * localT, g1 + (g2 - g1) * localT, b1 + (b2 - b1) * localT];
}
