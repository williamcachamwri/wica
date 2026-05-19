import { memo, useMemo } from "react";
import type { PixelFrame } from "../features/garden/types";

export type PixelSpriteConfig = {
  palette: Record<number, string>;
  gridWidth: number;
  gridHeight: number;
};

type PixelRendererProps = {
  config: PixelSpriteConfig;
  frame: PixelFrame;
  scale?: number;
  className?: string;
};

export const PixelRenderer = memo(function PixelRenderer({
  config,
  frame,
  scale = 3,
  className,
}: PixelRendererProps) {
  const { palette, gridWidth, gridHeight } = config;
  const pxWidth = gridWidth * scale;
  const pxHeight = gridHeight * scale;

  const rects = useMemo(() => {
    const els: React.JSX.Element[] = [];
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const v = frame[y]?.[x] ?? 0;
        if (v === 0) continue;
        els.push(
          <rect
            key={`${x}-${y}`}
            x={x * scale}
            y={y * scale}
            width={scale}
            height={scale}
            fill={palette[v] ?? palette[1]}
            shapeRendering="crispEdges"
          />,
        );
      }
    }
    return els;
  }, [frame, gridHeight, gridWidth, palette, scale]);

  return (
    <div className={className} style={{ imageRendering: "pixelated" }}>
      <svg
        viewBox={`0 0 ${pxWidth} ${pxHeight}`}
        width={pxWidth}
        height={pxHeight}
        role="img"
        style={{ display: "block" }}
      >
        {rects}
      </svg>
    </div>
  );
});
/* 3a2a8ce9 */
