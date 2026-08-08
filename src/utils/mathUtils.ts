import { Point2D } from '../types/geometry';

export const distance = (p1: Point2D, p2: Point2D) => {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
};

export const angleBetween = (cx: number, cy: number, px: number, py: number) => {
  return Math.atan2(py - cy, px - cx);
};

export const polarToCartesian = (cx: number, cy: number, r: number, angleRad: number): Point2D => {
  // SVG Y-axis points downwards, math standard is matched here naturally by Atan2/Sin.
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad)
  };
};

export const normalizeAngle = (angle: number) => {
  let a = angle % (2 * Math.PI);
  if (a < 0) a += 2 * Math.PI;
  return a;
};

// Generates SVG path definition for arcs and circles
export const describeArc = (x: number, y: number, radius: number, startAngle: number, sweepAngle: number) => {
  const endAngle = startAngle + sweepAngle;
  
  // 360-degree circle splitting to avoid start point deviation
  if (Math.abs(sweepAngle) >= Math.PI * 2 - 0.0001) {
    const p1 = polarToCartesian(x, y, radius, startAngle);
    const p2 = polarToCartesian(x, y, radius, startAngle + Math.PI);
    const sweepFlag = sweepAngle > 0 ? "1" : "0";
    return [
      `M ${p1.x} ${p1.y}`,
      `A ${radius} ${radius} 0 1 ${sweepFlag} ${p2.x} ${p2.y}`,
      `A ${radius} ${radius} 0 1 ${sweepFlag} ${p1.x} ${p1.y}`
    ].join(" ");
  }

  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);
  
  const largeArcFlag = Math.abs(sweepAngle) > Math.PI ? "1" : "0";
  const sweepFlag = sweepAngle > 0 ? "1" : "0"; // Positive sweep = CW = SVG sweepFlag 1
  
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, sweepFlag, end.x, end.y
  ].join(" ");
};

export const dotProduct = (v1: Point2D, v2: Point2D) => {
  return v1.x * v2.x + v1.y * v2.y;
};

export const crossProduct = (v1: Point2D, v2: Point2D) => {
  return v1.x * v2.y - v1.y * v2.x;
};

export const length = (v: Point2D) => {
  return Math.hypot(v.x, v.y);
};

export const normalize = (v: Point2D): Point2D => {
  const len = length(v);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
};

export const isPointOnLineSegment = (p: Point2D, a: Point2D, b: Point2D, epsilon: number = 0.1) => {
  const dAB = distance(a, b);
  const dAP = distance(a, p);
  const dPB = distance(p, b);
  return Math.abs(dAP + dPB - dAB) < epsilon;
};
