import { memo } from "react";
import { PixelRenderer } from "../../../components/PixelRenderer";
import { useGardenElementAnimation } from "../hooks/use-garden-element-animation";
import { GARDEN_ELEMENTS } from "../utils/pixel-garden-elements";
import type { GardenElementType, PixelFrame } from "../types";

type PixelGardenElementRendererProps = {
  element: GardenElementType;
  scale?: number;
  className?: string;
};

function PixelGardenElementRendererImpl({
  element,
  scale = 3,
  className,
}: PixelGardenElementRendererProps) {
  const config = GARDEN_ELEMENTS[element];
  if (config.frames.length <= 1) {
    return <StaticGardenElementRenderer element={element} scale={scale} className={className} />;
  }
  return <AnimatedGardenElementRenderer element={element} scale={scale} className={className} />;
}

type VariantProps = {
  element: GardenElementType;
  scale: number;
  className?: string;
};

const StaticGardenElementRenderer = memo(({ element, scale, className }: VariantProps) => {
  const { palette, gridWidth, gridHeight, frames } = GARDEN_ELEMENTS[element];
  const frame = frames[0] ?? [] as PixelFrame;
  return (
    <PixelRenderer
      config={{ palette, gridWidth, gridHeight }}
      frame={frame}
      scale={scale}
      className={className}
    />
  );
});

const AnimatedGardenElementRenderer = memo(({ element, scale, className }: VariantProps) => {
  const config = GARDEN_ELEMENTS[element];
  const frame = useGardenElementAnimation(config);
  return (
    <PixelRenderer
      config={{ palette: config.palette, gridWidth: config.gridWidth, gridHeight: config.gridHeight }}
      frame={frame}
      scale={scale}
      className={className}
    />
  );
});

export const PixelGardenElementRenderer = memo(PixelGardenElementRendererImpl);
/* 633097d2 */
