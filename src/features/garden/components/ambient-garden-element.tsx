import { useAmbientDrift } from "../hooks/use-ambient-drift";
import { PixelGardenElementRenderer } from "./pixel-garden-element-renderer";
import type { GardenElementType } from "../types";

type AmbientGardenElementProps = {
  idSeed: string;
  element: GardenElementType;
  scale: number;
};

export function AmbientGardenElement({ idSeed, element, scale }: AmbientGardenElementProps) {
  const { className, style } = useAmbientDrift({
    amplitude: 14,
    speed: 0.0006,
    seed: idSeed,
  });

  return (
    <div className={className} style={style}>
      <PixelGardenElementRenderer element={element} scale={scale} />
    </div>
  );
}
/* 0898412e */
