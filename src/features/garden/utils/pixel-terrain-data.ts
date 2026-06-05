export const CANVAS_COLS = 220;
export const CANVAS_ROWS = 120;
export const PIXEL_SIZE = 6;

export const TERRAIN_PALETTE: Record<number, string> = {
  // Deep space
  10: "#020205",
  11: "#050510",
  12: "#08081a",
  13: "#0c0c25",
  // Distant galaxies / nebula
  40: "#1a0b2e",
  41: "#241245",
  42: "#2d1555",
  // Stars
  50: "#ffffff",
  51: "#fffde7",
  52: "#e8eaf6",
  53: "#b3e5fc",
  54: "#ffccbc",
};

function seededRand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function seededRand2(seed: number): number {
  const x = Math.sin(seed * 269.5 + 183.3) * 32145.7631;
  return x - Math.floor(x);
}

function isDistantGalaxy(row: number, col: number): number | null {
  const gx1 = 32;
  const gy1 = 28;
  const dx1 = col - gx1;
  const dy1 = (row - gy1) * 2;
  const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  if (dist1 < 10) {
    const rng = seededRand(row * 313 + col + 1111);
    if (dist1 < 3) return rng > 0.3 ? 52 : 51;
    if (dist1 < 6) return rng > 0.4 ? 41 : 42;
    if (rng > 0.5) return 40;
  }

  const gx2 = 185;
  const gy2 = 24;
  const dx2 = col - gx2;
  const dy2 = (row - gy2) * 1.8;
  const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
  if (dist2 < 14) {
    const rng = seededRand2(row * 211 + col + 2222);
    if (dist2 < 5) return rng > 0.4 ? 42 : 41;
    if (rng > 0.55) return 40;
  }

  return null;
}

function isStar(row: number, col: number): number | null {
  const rng = seededRand(row * 513 + col * 17 + 9999);
  const rng2 = seededRand2(row * 223 + col * 61 + 7777);

  // Keep center clear for black hole
  const cx = CANVAS_COLS / 2;
  const cy = CANVAS_ROWS / 2 - 4;
  const dx = col - cx;
  const dy = (row - cy) * 1.6;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 70) return null;

  if (rng > 0.02) return null;

  if (rng2 < 0.08) return 54;
  if (rng2 < 0.2) return 53;
  if (rng2 < 0.45) return 52;
  if (rng2 < 0.7) return 51;
  return 50;
}

export function buildTerrainGrid(): number[][] {
  const grid: number[][] = [];

  for (let r = 0; r < CANVAS_ROWS; r++) {
    const row: number[] = [];
    for (let c = 0; c < CANVAS_COLS; c++) {
      row.push(getCellValue(r, c));
    }
    grid.push(row);
  }

  return grid;
}

function getCellValue(row: number, col: number): number {
  const rng = seededRand(row * CANVAS_COLS + col);

  // Distant galaxies
  const galaxy = isDistantGalaxy(row, col);
  if (galaxy !== null) return galaxy;

  // Stars
  const star = isStar(row, col);
  if (star !== null) return star;

  // Deep space gradient
  if (row < 25) return rng < 0.4 ? 11 : 10;
  if (row < 55) return rng < 0.5 ? 12 : 11;
  if (row < 85) return rng < 0.5 ? 13 : 12;
  return rng < 0.4 ? 12 : 11;
}
/* 1aeb762e */
