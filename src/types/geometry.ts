export type GeomId = string;

export interface Point2D {
  x: number;
  y: number;
}

export interface GeometryStyle {
  color?: string;
  strokeWidth?: number;
  dashStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface BaseGeom {
  id: GeomId;
  type: 'point' | 'line' | 'circle' | 'arc';
  selected?: boolean;
  source?: 'initial' | 'user';
  label?: string;
  style?: GeometryStyle;
}

export interface PointGeom extends BaseGeom {
  type: 'point';
  pt: Point2D;
}

export interface LineGeom extends BaseGeom {
  type: 'line';
  p1: Point2D;
  p2: Point2D;
}

export interface CircleGeom extends BaseGeom {
  type: 'circle';
  center: Point2D;
  radiusPt: Point2D;
  r: number;
}

export interface ArcGeom extends BaseGeom {
  type: 'arc';
  center: Point2D;
  r: number;
  startAngle: number;
  sweepAngle: number;
}

export type Geometry = PointGeom | LineGeom | CircleGeom | ArcGeom;

export interface ViewTransform {
  x: number;
  y: number;
  scale: number;
}
