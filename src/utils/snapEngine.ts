import { Geometry, Point2D } from '../types/geometry';
import { distance, normalizeAngle } from './mathUtils';

const MATH_EPS = 1e-6;

interface AABB { minX: number; minY: number; maxX: number; maxY: number; }

type CandidateType = 'point' | 'endpoint' | 'intersection' | 'center';
interface SnapCandidate {
  point: Point2D;
  type: CandidateType;
  priority: number;
}

const computeSegmentAABB = (p1: Point2D, p2: Point2D): AABB => {
  return {
    minX: Math.min(p1.x, p2.x),
    minY: Math.min(p1.y, p2.y),
    maxX: Math.max(p1.x, p2.x),
    maxY: Math.max(p1.y, p2.y),
  };
};

const computeCircleAABB = (center: Point2D, radius: number): AABB => {
  return {
    minX: center.x - radius,
    minY: center.y - radius,
    maxX: center.x + radius,
    maxY: center.y + radius,
  };
};

const aabbIntersects = (a: AABB, b: AABB): boolean => {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
};

const segmentCircleIntersections = (p1: Point2D, p2: Point2D, center: Point2D, r: number, eps: number): Point2D[] => {
  if (r <= eps) return [];

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < eps) return []; // Too short segment

  const fx = p1.x - center.x;
  const fy = p1.y - center.y;

  const A = lenSq;
  const B = 2 * (fx * dx + fy * dy);
  const C = fx * fx + fy * fy - r * r;

  const discriminant = B * B - 4 * A * C;
  
  if (discriminant < -eps) {
    return []; // No intersection
  }

  const tValues: number[] = [];
  if (Math.abs(discriminant) < eps) {
    tValues.push(-B / (2 * A)); // Tangent
  } else {
    const sqrtD = Math.sqrt(discriminant);
    tValues.push((-B - sqrtD) / (2 * A));
    tValues.push((-B + sqrtD) / (2 * A));
  }

  const intersections: Point2D[] = [];
  for (const t of tValues) {
    if (t >= -eps && t <= 1 + eps) {
      intersections.push({
        x: p1.x + t * dx,
        y: p1.y + t * dy
      });
    }
  }

  return intersections;
};

const isAngleWithinSweep = (angle: number, startAngle: number, sweepAngle: number, eps: number): boolean => {
  if (Math.abs(sweepAngle) < eps) return false;
  if (Math.abs(sweepAngle) >= Math.PI * 2 - eps) return true;
  
  const diff = normalizeAngle(angle - startAngle);
  if (sweepAngle > 0) {
    return diff <= sweepAngle + eps || diff >= 2 * Math.PI - eps;
  } else {
    return (diff >= 2 * Math.PI + sweepAngle - eps) || diff <= eps;
  }
};

// Calculates line-line intersection
const lineLineIntersection = (p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D): Point2D | null => {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (Math.abs(d) < MATH_EPS) return null; // parallel
  
  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  
  if (u < -MATH_EPS || u > 1 + MATH_EPS || v < -MATH_EPS || v > 1 + MATH_EPS) return null; // Outside segments
  
  return {
    x: p1.x + u * (p2.x - p1.x),
    y: p1.y + u * (p2.y - p1.y)
  };
};

const pushDeduped = (candidates: SnapCandidate[], newCand: SnapCandidate, mergeEps: number) => {
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const distSq = (c.point.x - newCand.point.x)**2 + (c.point.y - newCand.point.y)**2;
    if (distSq <= mergeEps * mergeEps) {
      if (newCand.priority < c.priority) {
        candidates[i] = newCand; // Override with higher priority
      }
      return;
    }
  }
  candidates.push(newCand);
};

// Given all geometries, generate snap candidates dynamically
const getSnapCandidates = (geoms: Geometry[], mergeEps: number): SnapCandidate[] => {
  const candidates: SnapCandidate[] = [];
  const lines: {p1: Point2D, p2: Point2D}[] = [];
  const circles: {center: Point2D, r: number, geom: Geometry}[] = [];
  
  geoms.forEach(g => {
    if (g.type === 'point') {
      pushDeduped(candidates, { point: g.pt, type: 'point', priority: 1 }, mergeEps);
    } else if (g.type === 'line') {
      pushDeduped(candidates, { point: g.p1, type: 'endpoint', priority: 2 }, mergeEps);
      pushDeduped(candidates, { point: g.p2, type: 'endpoint', priority: 2 }, mergeEps);
      lines.push({p1: g.p1, p2: g.p2});
    } else if (g.type === 'circle' || g.type === 'arc') {
      pushDeduped(candidates, { point: g.center, type: 'center', priority: 4 }, mergeEps);
      circles.push({center: g.center, r: g.r, geom: g});
      
      if (g.type === 'arc') {
        const p1x = g.center.x + g.r * Math.cos(g.startAngle);
        const p1y = g.center.y + g.r * Math.sin(g.startAngle);
        const p2x = g.center.x + g.r * Math.cos(g.startAngle + g.sweepAngle);
        const p2y = g.center.y + g.r * Math.sin(g.startAngle + g.sweepAngle);
        pushDeduped(candidates, { point: {x: p1x, y: p1y}, type: 'endpoint', priority: 2 }, mergeEps);
        pushDeduped(candidates, { point: {x: p2x, y: p2y}, type: 'endpoint', priority: 2 }, mergeEps);
      }
    }
  });

  // Calculate generic Line-Line intersections
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const isect = lineLineIntersection(lines[i].p1, lines[i].p2, lines[j].p1, lines[j].p2);
      if (isect) {
        pushDeduped(candidates, { point: isect, type: 'intersection', priority: 3 }, mergeEps);
      }
    }
  }
  
  // Calculate Line-Circle and Line-Arc Intersections
  for (const line of lines) {
    const lineAabb = computeSegmentAABB(line.p1, line.p2);
    for (const c of circles) {
      const circleAabb = computeCircleAABB(c.center, c.r);
      if (!aabbIntersects(lineAabb, circleAabb)) continue;

      const isects = segmentCircleIntersections(line.p1, line.p2, c.center, c.r, MATH_EPS);
      for (const pt of isects) {
        if (c.geom.type === 'arc') {
          const angle = Math.atan2(pt.y - c.center.y, pt.x - c.center.x);
          if (!isAngleWithinSweep(angle, c.geom.startAngle, c.geom.sweepAngle, MATH_EPS)) {
            continue;
          }
        }
        pushDeduped(candidates, { point: pt, type: 'intersection', priority: 3 }, mergeEps);
      }
    }
  }

  return candidates;
};

export const findSnapPoint = (
  rawPt: Point2D, 
  geoms: Geometry[], 
  scale: number, 
  activeMode: 'mouse' | 'touch'
): { pt: Point2D, snapped: boolean } => {
  // Screen-space 15px threshold. Touch mode 30px (Fat Finger handling).
  const screenThreshold = activeMode === 'touch' ? 30 : 15;
  const worldRadius = screenThreshold / scale;  // 역산: (15 * ctm.a) -> 15 / scale (since we need world dist)
  const mergeEps = 2 / scale;

  const candidates = getSnapCandidates(geoms, mergeEps);
  
  let bestPt = rawPt;
  let minScore = Infinity;
  let snapped = false;

  for (const c of candidates) {
    const d = distance(rawPt, c.point);
    if (d < worldRadius) {
      // Score = priority weight + distance
      // Priority step is worth 30% of the worldRadius
      const score = c.priority * (worldRadius * 0.3) + d;
      if (score < minScore) {
        minScore = score;
        bestPt = c.point;
        snapped = true;
      }
    }
  }
  
  if (snapped && activeMode === 'touch' && navigator.vibrate) {
     try { navigator.vibrate([20]); } catch (e) {} 
  }

  return { pt: bestPt, snapped };
};
