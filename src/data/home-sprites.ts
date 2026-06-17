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
// A tiny cat wearing headphones, typing calm things into the void.
// Ears at top, expressive eyes, visible nose, body with paws.
const CAT: PixelFrame = [
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0], // ear tips
  [0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0], // ear accent fill
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], // head top
  [0, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 0, 0], // headphones band
  [0, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 0, 0], // headphone pads
  [0, 7, 1, 1, 2, 2, 1, 1, 1, 2, 2, 1, 1, 7, 0, 0], // eyes (white)
  [0, 7, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 7, 0, 0], // pupils
  [0, 7, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 7, 0, 0], // nose highlight
  [0, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0], // mouth area
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0], // chin
  [0, 0, 3, 3, 1, 1, 1, 1, 1, 1, 1, 3, 3, 0, 0, 0], // chest accent stripe
  [0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1, 1, 0, 0, 0], // body mid
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], // body lower
  [0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0], // legs gap
  [0, 0, 1, 7, 0, 0, 1, 0, 0, 1, 0, 0, 7, 1, 0, 0], // paws (metal cuffs)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// ── Bonsai Pot ─────────────────────────────────────────────────────
// Multi-layered canopy, textured trunk, detailed ceramic pot.
const BONSAI: PixelFrame = [
  [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0], // crown tip
  [0, 0, 0, 0, 0, 0, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0], // canopy top
  [0, 0, 0, 0, 0, 5, 6, 6, 6, 5, 0, 0, 0, 0, 0, 0], // canopy with dark edges
  [0, 0, 0, 0, 6, 6, 5, 6, 5, 6, 6, 0, 0, 0, 0, 0], // canopy wide + texture
  [0, 0, 0, 5, 6, 6, 6, 6, 6, 6, 6, 5, 0, 0, 0, 0], // canopy widest
  [0, 0, 0, 0, 0, 5, 6, 5, 6, 5, 0, 0, 0, 0, 0, 0], // sub-canopy cluster
  [0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0], // trunk top
  [0, 0, 0, 0, 0, 2, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0], // trunk highlight
  [0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0], // trunk mid
  [0, 0, 0, 0, 0, 0, 4, 7, 4, 0, 0, 0, 0, 0, 0, 0], // trunk bark texture
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0], // pot rim
  [0, 0, 0, 1, 2, 5, 5, 5, 5, 5, 2, 5, 1, 0, 0, 0], // pot top (soil + highlight)
  [0, 0, 0, 1, 7, 5, 5, 5, 5, 5, 5, 7, 1, 0, 0, 0], // pot body upper
  [0, 0, 0, 1, 1, 7, 5, 5, 5, 5, 7, 1, 1, 0, 0, 0], // pot body taper
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0], // pot base
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// ── Portugal Flag ───────────────────────────────────────────────────
// Vamos Portugal! Pixel art flag com esfera armilar detalhada.
const PORTUGAL_PALETTE: Record<number, string> = {
  0: 'transparent',
  1: '#006633',  // green field
  2: '#CC0000',  // red field
  3: '#FFD700',  // gold (armillary sphere / border)
  4: '#FFFFFF',  // white (shield quinas background)
  5: '#0055A4',  // blue (shield escudetes)
  6: '#C8A000',  // dark gold (sphere shadow)
};

const PORTUGAL_CONFIG: PixelSpriteConfig = {
  palette: PORTUGAL_PALETTE,
  gridWidth: 16,
  gridHeight: 16,
};

const PORTUGAL_FLAG: PixelFrame = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], // row 1
  [1, 1, 1, 1, 1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], // col5 gold border
  [1, 1, 1, 1, 1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 3, 2, 2, 3, 6, 3, 2, 2, 2, 2, 2], // sphere ring hint
  [1, 1, 1, 1, 1, 3, 2, 3, 4, 4, 4, 3, 2, 2, 2, 2], // shield top
  [1, 1, 1, 1, 1, 3, 3, 4, 5, 4, 5, 4, 3, 2, 2, 2], // shield mid (quinas)
  [1, 1, 1, 1, 1, 3, 3, 4, 4, 3, 4, 4, 3, 2, 2, 2], // shield center (escudo)
  [1, 1, 1, 1, 1, 3, 3, 4, 5, 4, 5, 4, 3, 2, 2, 2], // shield mid mirror
  [1, 1, 1, 1, 1, 3, 2, 3, 4, 4, 4, 3, 2, 2, 2, 2], // shield base
  [1, 1, 1, 1, 1, 3, 2, 2, 3, 6, 3, 2, 2, 2, 2, 2], // sphere ring base
  [1, 1, 1, 1, 1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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