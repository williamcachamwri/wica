import { memo, useEffect, useMemo, useRef } from "react";
import {
  CANVAS_COLS,
  CANVAS_ROWS,
  PIXEL_SIZE,
  TERRAIN_PALETTE,
  buildTerrainGrid,
} from "../utils/pixel-terrain-data";
import { AmbientGardenElement } from "./ambient-garden-element";
import { PixelGardenElementRenderer } from "./pixel-garden-element-renderer";
import type { GardenObject } from "../types";

type PixelGardenCanvasProps = {
  objects: GardenObject[];
};

export function PixelGardenCanvas({ objects }: PixelGardenCanvasProps) {
  return (
    <div
      className="relative mx-auto w-full overflow-hidden"
      style={{
        imageRendering: "pixelated",
        aspectRatio: `${CANVAS_COLS} / ${CANVAS_ROWS}`,
      }}
    >
      <BlackHoleCanvas />
      <div
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      >
        {objects.map((obj) => (
          <GardenObjectRenderer key={obj.id} obj={obj} />
        ))}
      </div>
    </div>
  );
}

// ── Animated black hole canvas ────────────────────────────────────

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  brightness: number;
}

interface Star {
  x: number;
  y: number;
  brightness: number;
  size: number;
  phase: number;
}

const BlackHoleCanvas = memo(() => {
  const pxW = CANVAS_COLS * PIXEL_SIZE;
  const pxH = CANVAS_ROWS * PIXEL_SIZE;
  const grid = useMemo(() => buildTerrainGrid(), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    // Init particles spiraling into black hole
    particlesRef.current = Array.from({ length: 120 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 35 + Math.random() * 75,
      speed: 0.002 + Math.random() * 0.004,
      size: 1 + Math.random() * 2,
      brightness: 0.4 + Math.random() * 0.6,
    }));

    // Distant background stars
    starsRef.current = Array.from({ length: 220 }, () => ({
      x: Math.random() * CANVAS_COLS,
      y: Math.random() * CANVAS_ROWS,
      brightness: 0.25 + Math.random() * 0.75,
      size: Math.random() > 0.92 ? 2 : 1,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const cx = CANVAS_COLS / 2;
    const cy = CANVAS_ROWS / 2 - 4;
    const eventHorizonR = 13;
    const photonRingR = 17;
    const innerDiskR = 30;
    const outerDiskR = 62;

    let animationId: number;

    const drawBackground = () => {
      for (let r = 0; r < CANVAS_ROWS; r++) {
        for (let c = 0; c < CANVAS_COLS; c++) {
          const v = grid[r][c];
          const color = TERRAIN_PALETTE[v];
          if (!color) continue;
          ctx.fillStyle = color;
          ctx.fillRect(c * PIXEL_SIZE, r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      }
    };

    const drawBlackHole = (time: number) => {
      const rotation = time * 0.0003;

      for (let r = 0; r < CANVAS_ROWS; r++) {
        for (let c = 0; c < CANVAS_COLS; c++) {
          const dx = c - cx;
          const dy = (r - cy) * 1.55;
          const angle = Math.atan2(dy, dx);
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Event horizon (black shadow)
          if (dist < eventHorizonR) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(c * PIXEL_SIZE, r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            continue;
          }

          // Photon ring - very bright thin ring
          if (dist >= eventHorizonR && dist < photonRingR) {
            const ringT = (dist - eventHorizonR) / (photonRingR - eventHorizonR);
            const pulse = 0.75 + Math.sin(time * 0.008) * 0.25;
            if (ringT < 0.35) {
              ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
            } else if (ringT < 0.65) {
              ctx.fillStyle = `rgba(255, 248, 225, ${pulse * 0.95})`;
            } else {
              ctx.fillStyle = `rgba(255, 215, 0, ${pulse * 0.7})`;
            }
            ctx.fillRect(c * PIXEL_SIZE, r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            continue;
          }

          if (dist >= photonRingR && dist < outerDiskR) {
            const diskT = (dist - photonRingR) / (outerDiskR - photonRingR);

            // Accretion disk is an ellipse viewed at an angle.
            // We simulate the lensed back side as two arcs above and below the shadow.
            const verticalPos = Math.sin(angle); // 1 = top, -1 = bottom, 0 = sides
            const isBackArc = Math.abs(verticalPos) > 0.35;

            // Back arcs (lensed over the shadow) are thinner and dimmer
            if (isBackArc) {
              if (diskT > 0.55) continue;
              const arcWidth = 1 - Math.abs(verticalPos);
              if (arcWidth < 0.25) continue;

              const doppler = (Math.cos(angle - rotation + Math.PI) + 1) / 2;
              const color = diskT < 0.25
                ? (doppler > 0.4 ? "#ffca28" : "#ffb300")
                : (doppler > 0.3 ? "#ff8f00" : "#e65100");

              ctx.globalAlpha = 0.6 + doppler * 0.3;
              ctx.fillStyle = color;
              ctx.fillRect(c * PIXEL_SIZE, r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
              ctx.globalAlpha = 1;
              continue;
            }

            // Front disk - main bright body
            const spiral = Math.sin(angle * 4 + dist * 0.2 - rotation * 3) * 0.5 + 0.5;
            // Doppler beaming: approaching side (right) is brighter/hotter
            const doppler = (Math.cos(angle - rotation) + 1) / 2;

            // Taper the disk at top and bottom
            const edgeFade = 1 - Math.pow(Math.abs(verticalPos), 3);
            if (edgeFade < 0.15) continue;

            let color: string;
            let alpha = edgeFade;

            if (diskT < 0.1) {
              color = doppler > 0.55 ? "#ffffff" : "#fff8e1";
            } else if (diskT < 0.22) {
              color = doppler > 0.5 ? "#ffecb3" : "#ffd54f";
            } else if (diskT < 0.38) {
              color = doppler > 0.45 ? "#ffca28" : "#ffb300";
            } else if (diskT < 0.55) {
              color = doppler > 0.38 ? "#ffb300" : "#ff8f00";
            } else if (diskT < 0.72) {
              color = doppler > 0.3 ? "#ff8f00" : "#e65100";
              alpha *= 0.9;
            } else if (diskT < 0.88) {
              color = spiral > 0.3 ? "#e65100" : "#bf360c";
              alpha *= 0.75;
            } else {
              color = spiral > 0.25 ? "#bf360c" : "#870000";
              alpha *= 0.55;
            }

            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.fillRect(c * PIXEL_SIZE, r * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            ctx.globalAlpha = 1;
          }
        }
      }
    };

    const drawStars = (time: number) => {
      const thetaE = 68; // Einstein radius in grid units

      starsRef.current.forEach((s) => {
        const dx = s.x - cx;
        const dy = (s.y - cy) * 1.55;
        const beta = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Gravitational lensing: point-mass lens image position
        const theta = (beta + Math.sqrt(beta * beta + 4 * thetaE * thetaE)) / 2;

        const lx = cx + Math.cos(angle) * theta;
        const ly = cy + Math.sin(angle) * theta / 1.55;

        // Magnification boost near Einstein radius / behind the hole
        let magnification = 1;
        if (beta > 0.5) {
          const ratio = theta / beta;
          magnification = ratio * ratio * ratio * (ratio + 1 / ratio) * 0.5;
        } else {
          magnification = 8; // directly behind -> Einstein ring
        }

        const twinkle = 0.7 + Math.sin(time * 0.002 + s.phase) * 0.3;
        const alpha = Math.min(1, s.brightness * twinkle * magnification * 0.45);

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(
          Math.round(lx * PIXEL_SIZE),
          Math.round(ly * PIXEL_SIZE),
          s.size * PIXEL_SIZE,
          s.size * PIXEL_SIZE,
        );
      });
    };

    const drawParticles = (time: number) => {
      particlesRef.current.forEach((p, i) => {
        // Spiral inward
        p.angle += p.speed * (1 + 50 / Math.max(5, p.radius));
        p.radius -= 0.04 + (70 - p.radius) * 0.0003;

        // Reset when swallowed
        if (p.radius < eventHorizonR + 2) {
          p.radius = 75 + Math.random() * 40;
          p.angle = Math.random() * Math.PI * 2;
          p.brightness = 0.4 + Math.random() * 0.6;
        }

        // Warp position near black hole - gravitational lensing effect
        const rawX = cx + Math.cos(p.angle) * p.radius;
        const rawY = cy + Math.sin(p.angle) * p.radius / 1.55;

        const ddx = rawX - cx;
        const ddy = (rawY - cy) * 1.55;
        const dDist = Math.sqrt(ddx * ddx + ddy * ddy);

        // Pull particles toward the disk plane near center
        let x = rawX;
        let y = rawY;
        if (dDist < 45) {
          const pull = 1 - dDist / 45;
          const diskAngle = Math.atan2(ddy, ddx);
          const targetY = cy + Math.sin(diskAngle) * dDist / 1.55;
          y = y + (targetY - y) * pull * 0.7;
        }

        const twinkle = 0.5 + Math.sin(time * 0.005 + i * 0.5) * 0.5;
        const alpha = p.brightness * twinkle * Math.min(1, (p.radius - eventHorizonR) / 20);

        ctx.fillStyle = `rgba(255, 236, 179, ${alpha})`;
        ctx.fillRect(
          Math.round(x * PIXEL_SIZE),
          Math.round(y * PIXEL_SIZE),
          p.size * PIXEL_SIZE,
          p.size * PIXEL_SIZE,
        );
      });
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, pxW, pxH);
      drawBackground();
      drawStars(time);
      drawBlackHole(time);
      drawParticles(time);
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationId);
  }, [grid, pxH, pxW]);

  return (
    <canvas
      ref={canvasRef}
      width={pxW}
      height={pxH}
      aria-hidden="true"
      className="block h-auto w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
});

// ── Pixel shadow ────────────────────────────────────────────────

const PixelShadow = memo(
  ({
    scale,
    variant,
  }: {
    scale: number;
    variant: "plant" | "decoration";
  }) => {
    const widthBlocks = variant === "plant" ? 3 : 4;
    const heightBlocks = 1;
    const ps = Math.max(2, Math.round(scale * 1.2));
    const w = widthBlocks * ps;
    const h = heightBlocks * ps;

    const rects = useMemo(() => {
      const els: React.JSX.Element[] = [];
      for (let r = 0; r < heightBlocks; r++) {
        for (let c = 0; c < widthBlocks; c++) {
          els.push(
            <rect
              key={`${c}-${r}`}
              x={c * ps}
              y={r * ps}
              width={ps}
              height={ps}
              fill="rgba(0, 0, 0, 0.35)"
              shapeRendering="crispEdges"
            />,
          );
        }
      }
      return els;
    }, [heightBlocks, ps, widthBlocks]);

    return (
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{
          display: "block",
          margin: "0 auto",
          imageRendering: "pixelated",
          transform: `translateY(-${Math.round(h * 0.3)}px)`,
        }}
      >
        {rects}
      </svg>
    );
  },
);

const GardenObjectRenderer = memo(({ obj }: { obj: GardenObject }) => {
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${obj.x}%`,
    top: `${obj.y}%`,
    zIndex: obj.zIndex ?? 2,
    transform: "translate(-50%, -100%)",
    pointerEvents: "none",
  };

  if (obj.type === "ambient" && obj.element) {
    return (
      <div style={style}>
        <AmbientGardenElement idSeed={obj.id} element={obj.element} scale={obj.scale ?? 2} />
      </div>
    );
  }

  if (obj.element) {
    const shadowVariant = obj.type === "plant" ? "plant" : "decoration";
    return (
      <div style={style}>
        <PixelGardenElementRenderer element={obj.element} scale={obj.scale ?? 2} />
        <PixelShadow scale={obj.scale ?? 2} variant={shadowVariant} />
      </div>
    );
  }

  return null;
});
/* dc1d36d5 */
