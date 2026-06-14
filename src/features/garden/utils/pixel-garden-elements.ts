import type { GardenElementConfig, GardenElementType, PixelFrame } from "../types";

// ── Astronaut (12 × 16) ───────────────────────────────────────────
const ASTRONAUT_PALETTE: Record<number, string> = {
  0: "transparent",
  1: "#e5e7eb", // suit light
  2: "#9ca3af", // suit shadow
  3: "#1f2937", // visor
  4: "var(--accent)", // accent detail
};

const ASTRONAUT_BASE: PixelFrame = [
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 0, 0],
  [0, 0, 1, 3, 3, 3, 3, 3, 3, 1, 0, 0],
  [0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function buildAstronautFloat(): PixelFrame[] {
  const up = ASTRONAUT_BASE.map((r) => [...r]);
  for (let i = 0; i < 4; i++) {
    up.unshift(up.pop() as number[]);
  }
  return [ASTRONAUT_BASE, ASTRONAUT_BASE, up, up, ASTRONAUT_BASE, ASTRONAUT_BASE];
}

// ── Rocket (12 × 16) ──────────────────────────────────────────────
const ROCKET_PALETTE: Record<number, string> = {
  0: "transparent",
  1: "#ef4444", // body
  2: "#f87171", // highlight
  3: "#e5e7eb", // window
  4: "#fbbf24", // flame
  5: "#f97316", // flame core
};

const ROCKET_BASE: PixelFrame = [
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 2, 2, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 3, 3, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 3, 3, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 4, 4, 0, 0, 0, 0, 4, 4, 0, 0],
  [0, 0, 5, 5, 0, 0, 0, 0, 5, 5, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// ── UFO (16 × 8) ──────────────────────────────────────────────────
const UFO_PALETTE: Record<number, string> = {
  0: "transparent",
  1: "#6b7280", // body
  2: "#9ca3af", // dome
  3: "var(--accent)", // lights
  4: "#d1d5db", // highlight
};

const UFO_BASE: PixelFrame = [
  [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// ── Satellite (14 × 12) ───────────────────────────────────────────
const SATELLITE_PALETTE: Record<number, string> = {
  0: "transparent",
  1: "#4b5563", // body
  2: "#1d4ed8", // solar panel
  3: "#93c5fd", // panel highlight
  4: "#d1d5db", // antenna
};

const SATELLITE_BASE: PixelFrame = [
  [0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// ── Alien crystal (10 × 14) ───────────────────────────────────────
const CRYSTAL_PALETTE: Record<number, string> = {
  0: "transparent",
  1: "#a855f7", // crystal
  2: "#c084fc", // highlight
  3: "#7e22ce", // shadow
  4: "#f3e8ff", // tip glow
};

const CRYSTAL_BASE: PixelFrame = [
  [0, 0, 0, 0, 4, 4, 0, 0, 0, 0],
  [0, 0, 0, 4, 2, 2, 4, 0, 0, 0],
  [0, 0, 4, 2, 2, 2, 2, 4, 0, 0],
  [0, 0, 4, 2, 1, 1, 2, 4, 0, 0],
  [0, 4, 2, 1, 1, 1, 1, 2, 4, 0],
  [0, 4, 2, 1, 1, 1, 1, 2, 4, 0],
  [0, 4, 2, 1, 1, 1, 1, 2, 4, 0],
  [0, 0, 4, 1, 1, 1, 1, 4, 0, 0],
  [0, 0, 4, 1, 3, 3, 1, 4, 0, 0],
  [0, 0, 0, 1, 3, 3, 1, 0, 0, 0],
  [0, 0, 0, 1, 3, 3, 1, 0, 0, 0],
  [0, 0, 0, 1, 3, 3, 1, 0, 0, 0],
  [0, 0, 0, 0, 3, 3, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function buildCrystalPulse(): PixelFrame[] {
  const glow = CRYSTAL_BASE.map((r) => r.map((v) => (v === 1 ? 2 : v === 3 ? 1 : v)));
  return [CRYSTAL_BASE, CRYSTAL_BASE, glow, glow, CRYSTAL_BASE, CRYSTAL_BASE];
}

// ── Comet (8 × 6) ─────────────────────────────────────────────────
const COMET_PALETTE: Record<number, string> = {
  0: "transparent",
  1: "#ffffff", // head
  2: "#93c5fd", // tail
  3: "#60a5fa", // tail deep
};

const COMET_1: PixelFrame = [
  [0, 0, 0, 0, 0, 1, 1, 0],
  [0, 0, 0, 0, 1, 1, 2, 0],
  [0, 0, 0, 1, 2, 2, 3, 0],
  [0, 0, 1, 2, 2, 3, 3, 0],
  [0, 0, 0, 2, 3, 3, 0, 0],
  [0, 0, 0, 0, 3, 0, 0, 0],
];

const COMET_2: PixelFrame = [
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 2, 0],
  [0, 0, 0, 1, 2, 2, 2, 0],
  [0, 0, 1, 2, 2, 2, 3, 0],
  [0, 0, 0, 2, 2, 3, 0, 0],
  [0, 0, 0, 0, 3, 0, 0, 0],
];

// ── Space rock (8 × 5) ────────────────────────────────────────────
const ROCK_PALETTE: Record<number, string> = {
  0: "transparent",
  1: "#4b5563",
  2: "#6b7280",
  3: "#374151",
};

const ROCK_BASE: PixelFrame = [
  [0, 0, 0, 2, 2, 0, 0, 0],
  [0, 0, 2, 1, 1, 2, 0, 0],
  [0, 2, 1, 1, 3, 1, 2, 0],
  [2, 1, 1, 3, 3, 1, 1, 2],
  [0, 2, 2, 1, 1, 2, 2, 0],
];

// ── Moon flag (6 × 12) ────────────────────────────────────────────
const FLAG_PALETTE: Record<number, string> = {
  0: "transparent",
  1: "#d1d5db", // pole
  2: "var(--accent)", // flag
};

const FLAG_BASE: PixelFrame = [
  [0, 0, 1, 2, 2, 0],
  [0, 0, 1, 2, 2, 2],
  [0, 0, 1, 2, 2, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0],
];

export const GARDEN_ELEMENTS: Record<GardenElementType, GardenElementConfig> = {
  astronaut: {
    palette: ASTRONAUT_PALETTE,
    gridWidth: 12,
    gridHeight: 16,
    frames: buildAstronautFloat(),
    frameDuration: 500,
    loop: true,
  },
  rocket: {
    palette: ROCKET_PALETTE,
    gridWidth: 12,
    gridHeight: 16,
    frames: [ROCKET_BASE],
    frameDuration: 1000,
    loop: false,
  },
  ufo: {
    palette: UFO_PALETTE,
    gridWidth: 16,
    gridHeight: 8,
    frames: [UFO_BASE],
    frameDuration: 1000,
    loop: false,
  },
  satellite: {
    palette: SATELLITE_PALETTE,
    gridWidth: 14,
    gridHeight: 12,
    frames: [SATELLITE_BASE],
    frameDuration: 1000,
    loop: false,
  },
  crystal: {
    palette: CRYSTAL_PALETTE,
    gridWidth: 10,
    gridHeight: 14,
    frames: buildCrystalPulse(),
    frameDuration: 600,
    loop: true,
  },
  comet: {
    palette: COMET_PALETTE,
    gridWidth: 8,
    gridHeight: 6,
    frames: [COMET_1, COMET_1, COMET_2, COMET_2],
    frameDuration: 200,
    loop: true,
  },
  rock: {
    palette: ROCK_PALETTE,
    gridWidth: 8,
    gridHeight: 5,
    frames: [ROCK_BASE],
    frameDuration: 1000,
    loop: false,
  },
  flag: {
    palette: FLAG_PALETTE,
    gridWidth: 6,
    gridHeight: 12,
    frames: [FLAG_BASE],
    frameDuration: 1000,
    loop: false,
  },
  tree: {
    palette: CRYSTAL_PALETTE,
    gridWidth: 10,
    gridHeight: 16,
    frames: buildCrystalPulse(),
    frameDuration: 600,
    loop: true,
  },
  bush: {
    palette: CRYSTAL_PALETTE,
    gridWidth: 12,
    gridHeight: 8,
    frames: [CRYSTAL_BASE.map((r) => [...r, ...r])],
    frameDuration: 1000,
    loop: false,
  },
  sunflower: {
    palette: CRYSTAL_PALETTE,
    gridWidth: 10,
    gridHeight: 16,
    frames: buildCrystalPulse(),
    frameDuration: 600,
    loop: true,
  },
  daisy: {
    palette: COMET_PALETTE,
    gridWidth: 8,
    gridHeight: 6,
    frames: [COMET_1],
    frameDuration: 1000,
    loop: false,
  },
  mushroom: {
    palette: ROCK_PALETTE,
    gridWidth: 6,
    gridHeight: 6,
    frames: [
      [
        [0, 0, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 0],
        [0, 1, 2, 1, 1, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 0],
      ],
    ],
    frameDuration: 1000,
    loop: false,
  },
  sign: {
    palette: FLAG_PALETTE,
    gridWidth: 6,
    gridHeight: 12,
    frames: [FLAG_BASE],
    frameDuration: 1000,
    loop: false,
  },
  tulip: {
    palette: CRYSTAL_PALETTE,
    gridWidth: 6,
    gridHeight: 10,
    frames: [
      [
        [0, 0, 4, 4, 0, 0],
        [0, 4, 2, 2, 4, 0],
        [0, 4, 1, 1, 4, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ],
    ],
    frameDuration: 1000,
    loop: false,
  },
  "grass-tuft": {
    palette: CRYSTAL_PALETTE,
    gridWidth: 6,
    gridHeight: 4,
    frames: [
      [
        [0, 4, 0, 0, 4, 0],
        [4, 1, 4, 4, 1, 4],
        [0, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 0, 0],
      ],
    ],
    frameDuration: 1000,
    loop: false,
  },
  butterfly: {
    palette: COMET_PALETTE,
    gridWidth: 8,
    gridHeight: 6,
    frames: [COMET_1, COMET_1, COMET_2, COMET_2],
    frameDuration: 200,
    loop: true,
  },
};
