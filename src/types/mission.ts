import { Point2D } from './geometry';

import { Geometry } from './geometry';

export type GeometryObjectType = 'point' | 'segment' | 'line' | 'circle' | 'arc';

export interface Vec2 extends Point2D {
  x: number;
  y: number;
}

export interface GeometryObject {
  id: string;
  type: GeometryObjectType;
  points: Vec2[];
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  label?: string;
  source: 'initial' | 'user';
}

export interface MissionDefinition {
  id: string;
  stage: 1 | 2 | 3;
  title: string;
  description: string;
  referenceLabels: Record<string, string>;
  validate: (objects: GeometryObject[], refs: Readonly<Record<string, GeometryObject>>) => ValidationResult;
  initialGeometries?: () => Geometry[];
}

export type FeedbackCode =
  | 'SUCCESS'
  | 'NO_CANDIDATE_FOUND'
  | 'WRONG_OBJECT_TYPE'
  | 'WRONG_ANCHOR_POINT'
  | 'LENGTH_MISMATCH'
  | 'ANGLE_MISMATCH'
  | 'NOT_PERPENDICULAR'
  | 'NOT_THROUGH_MIDPOINT'
  | 'NOT_THROUGH_POINT';

export interface ValidationResult {
  isSuccess: boolean;
  feedbackCode: FeedbackCode;
  message: string;
}
