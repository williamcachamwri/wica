import { PixelRenderer } from "../components/PixelRenderer";
import { HOME_SPRITES } from "./home-sprites";
import type { SpriteItem } from "../types";

const CatSprite = () => (
  <PixelRenderer config={HOME_SPRITES.cat.config} frame={HOME_SPRITES.cat.frame} scale={2.75} />
);

const BonsaiSprite = () => (
  <PixelRenderer config={HOME_SPRITES.bonsai.config} frame={HOME_SPRITES.bonsai.frame} scale={2.75} />
);

const PortugalSprite = () => (
  <PixelRenderer config={HOME_SPRITES.portugal.config} frame={HOME_SPRITES.portugal.frame} scale={2.75} />
);

export const sprites: SpriteItem[] = [
  { id: "cat", el: <CatSprite />, delay: 0 },
  { id: "bonsai", el: <BonsaiSprite />, delay: 0.18 },
];

export const portugalSprite: SpriteItem = { id: "portugal", el: <PortugalSprite />, delay: 0 };
