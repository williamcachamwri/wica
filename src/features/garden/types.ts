export type PixelFrame = number[][];

export type GardenElementType =
  | "sunflower"
  | "daisy"
  | "grass-tuft"
  | "bush"
  | "butterfly"
  | "rock"
  | "mushroom"
  | "tree"
  | "sign"
  | "tulip"
  | "astronaut"
  | "rocket"
  | "ufo"
  | "satellite"
  | "crystal"
  | "comet"
  | "flag";

export type GardenElementConfig = {
  palette: Record<number, string>;
  gridWidth: number;
  gridHeight: number;
  frames: PixelFrame[];
  frameDuration: number;
  loop: boolean;
};

export type GardenObjectType = "plant" | "decoration" | "ambient";

export type GardenObject = {
  id: string;
  type: GardenObjectType;
  x: number;
  y: number;
  zIndex?: number;
  scale?: number;
  element?: GardenElementType;
};
/* 35d63811 */
