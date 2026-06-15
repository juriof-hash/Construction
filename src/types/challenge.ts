// src/types/challenge.ts
import { GeometryObject } from "./mission";
import { Geometry } from "./geometry";

export type StarRating = 1 | 2 | 3;

export interface ScoreResult {
  stars: StarRating;
  titles: string[];
}

export interface ChallengeValidationResult {
  isSuccess: boolean;
  message: string;
  score?: ScoreResult;
}

export interface PlayerStats {
  elapsedTimeSec: number;
  compassCount: number;
}

export interface ChallengeMissionData {
  id: string;
  stage: number;
  level: number;
  title: string;
  description: string;
  optimalCompassCount: number;
  targetTimeSec: number;
  referenceLabels: Record<string, string>;
  initialGeometries: () => Geometry[];
  validate: (
    objects: GeometryObject[],
    refs: Record<string, GeometryObject>,
    stats: PlayerStats,
  ) => ChallengeValidationResult;
}
