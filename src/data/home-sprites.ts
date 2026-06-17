import type { PixelFrame } from "../features/garden/types";
import type { PixelSpriteConfig } from "../components/PixelRenderer";

const HOME_PALETTE: Record<number, string> = {
  0: "transparent",
  1: "#1a1a1a",        // body / outline
  2: "#fafafa",        // highlight / face
  3: "var(--accent)",  // accent
  4: "#8B5A2B",        // wood / trunk
  5: "#4A7C3F",        // soil / leaf dark
  6: "#6AAF50",        // leaf light
  7: "#E5E5E5",        // metal / grey
};

const HOME_CONFIG: PixelSpriteConfig = {
  palette: HOME_PALETTE,
  gridWidth: 16,
  gridHeight: 16,
};

// ── Coder Cat ──────────────────────────────────────────────────────
// Solid silhouette, no floating pixels. Headphones as thick band.
const CAT: PixelFrame = [
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0], // ear tips
  [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], // ears
  [0, 0, 0, 1, 3, 1, 1, 1, 1, 1, 1, 3, 1, 0, 0, 0], // ear inner accent
  [0, 0, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 0, 0], // headphone band
  [0, 0, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 0, 0], // headphone pad row
  [0, 0, 7, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 7, 0, 0], // eyes white
  [0, 0, 7, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 7, 0, 0], // pupils
  [0, 0, 7, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 7, 0, 0], // nose
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], // chin
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], // neck
  [0, 0, 0, 3, 3, 1, 1, 1, 1, 1, 1, 3, 3, 0, 0, 0], // chest accent
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], // body
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], // body
  [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], // legs
  [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0], // paws gap
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// ── Bonsai Pot ─────────────────────────────────────────────────────
// Clean solid canopy blocks, simple trunk, solid pot.
const BONSAI: PixelFrame = [
  [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0], // crown tip
  [0, 0, 0, 0, 0, 0, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0], // canopy top
  [0, 0, 0, 0, 0, 6, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0], // canopy mid
  [0, 0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0, 0, 0], // canopy wide
  [0, 0, 0, 5, 5, 6, 6, 6, 6, 6, 5, 5, 0, 0, 0, 0], // canopy base (dark edge)
  [0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0], // sub-layer
  [0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0], // trunk top
  [0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0], // trunk
  [0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0], // trunk
  [0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0], // trunk base
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0], // pot rim
  [0, 0, 0, 1, 1, 5, 5, 5, 5, 5, 5, 1, 1, 0, 0, 0], // pot soil
  [0, 0, 0, 1, 1, 5, 5, 5, 5, 5, 5, 1, 1, 0, 0, 0], // pot body
  [0, 0, 0, 1, 1, 5, 5, 5, 5, 5, 5, 1, 1, 0, 0, 0], // pot body
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0], // pot base
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// ── Portugal Flag ───────────────────────────────────────────────────
// Clean 5-col green / 10-col red split. Shield centered on border.
const PORTUGAL_PALETTE: Record<number, string> = {
  0: "transparent",
  1: "#006633",  // green
  2: "#CC0000",  // red
  3: "#FFD700",  // gold
  4: "#FFFFFF",  // white
  5: "#0055A4",  // blue
};

const PORTUGAL_CONFIG: PixelSpriteConfig = {
  palette: PORTUGAL_PALETTE,
  gridWidth: 16,
  gridHeight: 16,
};

const PORTUGAL_FLAG: PixelFrame = [
  [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 3, 3, 2, 2, 2, 2], // sphere top arc
  [1, 1, 1, 1, 1, 2, 3, 4, 4, 4, 4, 4, 3, 2, 2, 2], // shield top
  [1, 1, 1, 1, 1, 3, 3, 4, 5, 4, 5, 4, 3, 3, 2, 2], // quinas row (on border)
  [1, 1, 1, 1, 1, 3, 3, 4, 4, 3, 4, 4, 3, 3, 2, 2], // center escudo
  [1, 1, 1, 1, 1, 3, 3, 4, 5, 4, 5, 4, 3, 3, 2, 2], // quinas row mirror
  [1, 1, 1, 1, 1, 2, 3, 4, 4, 4, 4, 4, 3, 2, 2, 2], // shield base
  [1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 3, 3, 2, 2, 2, 2], // sphere bottom arc
  [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
];

export type HomeSpriteType = "cat" | "bonsai" | "portugal";

export const HOME_SPRITES: Record<
  HomeSpriteType,
  { config: PixelSpriteConfig; frame: PixelFrame }
> = {
  cat: { config: HOME_CONFIG, frame: CAT },
  bonsai: { config: HOME_CONFIG, frame: BONSAI },
  portugal: { config: PORTUGAL_CONFIG, frame: PORTUGAL_FLAG },
};