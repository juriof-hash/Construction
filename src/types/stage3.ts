import { Point2D } from "./geometry";

// Stage 3 specific interfaces for types
export interface Stage3MissionContext {
  originSides: number[];
  validAngles: boolean;
}

export interface TriangleCongruenceResult {
  isCongruent: boolean;
  userSides: number[];
}
