import type { GardenObject } from "../types";

export const GARDEN_OBJECTS: GardenObject[] = [
  // Tiny satellites orbiting in the distance
  { id: "satellite-1", type: "ambient", x: 18, y: 22, zIndex: 2, scale: 1.8, element: "satellite" },
  { id: "satellite-2", type: "ambient", x: 84, y: 18, zIndex: 2, scale: 1.5, element: "satellite" },

  // Small comets drifting across the scene
  { id: "comet-1", type: "ambient", x: 12, y: 38, zIndex: 3, scale: 2, element: "comet" },
  { id: "comet-2", type: "ambient", x: 90, y: 32, zIndex: 3, scale: 1.8, element: "comet" },
  { id: "comet-3", type: "ambient", x: 78, y: 48, zIndex: 3, scale: 1.6, element: "comet" },

  // A lone astronaut floating near the bottom left
  { id: "astronaut-1", type: "plant", x: 10, y: 82, zIndex: 4, scale: 2.5, element: "astronaut" },

  // A small rocket drifting near bottom right
  { id: "rocket-1", type: "decoration", x: 92, y: 78, zIndex: 4, scale: 2.2, element: "rocket" },
];
/* c0014190 */
