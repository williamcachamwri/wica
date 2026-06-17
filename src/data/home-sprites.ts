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
// A tiny cat wearing headphones, ready to build calm things.
const CAT: PixelFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,3,3,3,3,3,3,0,0,0,0,0,0],
  [0,0,0,3,3,3,3,3,3,3,3,0,0,0,0,0],
  [0,0,3,3,1,1,1,1,1,1,3,3,0,0,0,0],
  [0,0,3,1,1,1,1,1,1,1,1,3,0,0,0,0],
  [0,3,3,1,1,2,2,1,2,2,1,3,3,0,0,0],
  [0,3,1,1,1,2,2,1,2,2,1,1,3,0,0,0],
  [0,3,1,1,1,1,1,1,1,1,1,1,3,0,0,0],
  [0,0,3,1,1,1,1,1,1,1,1,3,0,0,0,0],
  [0,0,0,3,1,1,1,1,1,1,3,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// ── Bonsai Pot ─────────────────────────────────────────────────────
// A small potted bonsai, because good ideas grow slowly.
const BONSAI: PixelFrame = [
  [0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,6,6,6,0,0,0,0,0,0,0],
  [0,0,0,0,0,6,6,6,6,6,0,0,0,0,0,0],
  [0,0,0,0,6,6,6,6,6,6,6,0,0,0,0,0],
  [0,0,0,0,0,0,4,4,4,0,0,0,0,0,0,0],
  [0,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0],
  [0,0,0,0,0,0,4,4,4,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,4,4,4,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,4,4,4,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,5,5,5,5,5,5,1,1,0,0,0],
  [0,0,0,1,1,5,5,5,5,5,5,1,1,0,0,0],
  [0,0,0,1,1,5,5,5,5,5,5,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// ── Portugal Flag ───────────────────────────────────────────────────
// Vamos Portugal! Pixel art flag com esfera armilar.
const PORTUGAL_PALETTE: Record<number, string> = {
  0: 'transparent',
  1: '#006633',  // green field
  2: '#CC0000',  // red field
  3: '#FFD700',  // gold (armillary sphere / castles)
  4: '#FFFFFF',  // white (shield)
  5: '#0055A4',  // blue (shield interior)
};

const PORTUGAL_CONFIG: PixelSpriteConfig = {
  palette: PORTUGAL_PALETTE,
  gridWidth: 16,
  gridHeight: 16,
};

const PORTUGAL_FLAG: PixelFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2],
  [1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2],
  [1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2],
  [1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2],
  [1,1,1,1,1,1,2,2,3,3,3,2,2,2,2,2],
  [1,1,1,1,1,1,2,3,3,3,3,3,2,2,2,2],
  [1,1,1,1,1,1,3,4,5,5,4,3,2,2,2,2],
  [1,1,1,1,1,1,3,4,5,5,4,3,2,2,2,2],
  [1,1,1,1,1,1,2,3,3,3,3,3,2,2,2,2],
  [1,1,1,1,1,1,2,2,3,3,3,2,2,2,2,2],
  [1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2],
  [1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2],
  [1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2],
  [1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
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
