import { useEffect, useRef, useState } from "react";
import type { PixelFrame } from "../types";
import type { GardenElementConfig } from "../utils/pixel-garden-elements";

export function useGardenElementAnimation(config: GardenElementConfig): PixelFrame {
  const { frames, frameDuration, loop } = config;
  const [index, setIndex] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(() =>
    typeof document === "undefined" ? true : !document.hidden,
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shouldAnimate = !prefersReducedMotion && frames.length > 1 && isPageVisible;

  useEffect(() => {
    if (!shouldAnimate) return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= frames.length) {
          if (loop) return 0;
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        return next;
      });
    }, frameDuration);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [frameDuration, loop, shouldAnimate, frames.length]);

  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPageVisible(false);
      } else {
        setIsPageVisible(true);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  if (prefersReducedMotion) return frames[0];
  return frames[index] ?? frames[0];
}
/* d4587455 */
