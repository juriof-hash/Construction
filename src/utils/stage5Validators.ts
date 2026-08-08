import { GeometryObject } from "../types/mission";
import { ChallengeValidationResult, PlayerStats } from "../types/challenge";
import { distance, dotProduct, crossProduct, length, normalize, isPointOnLineSegment } from "./mathUtils";
import { distancePointToInfiniteLine } from "./geoGraphValidation";
import { calculateScore } from "../data/stage1Validators";

// Helper to get relative epsilon
function getEpsilons(points: {x: number, y: number}[]) {
  let maxDist = 0;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      maxDist = Math.max(maxDist, distance(points[i], points[j]));
    }
  }
  return {
    EPSILON_DIST: Math.max(5, maxDist * 0.03),
    EPSILON_RADIUS: Math.max(5, maxDist * 0.04),
    EPSILON_ANGLE: 0.02
  };
}

export function validatePerpendicularLine(
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats
): ChallengeValidationResult {
  const lineL = refs["l"];
  const pointP = refs["P"]?.points[0];

  if (!lineL || !pointP) return { isSuccess: false, message: "기본 도형이 없습니다." };
  
  const A = lineL.points[0];
  const B = lineL.points[1];
  
  const { EPSILON_DIST, EPSILON_ANGLE } = getEpsilons([A, B, pointP]);

  // Calculate perpendicular foot
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const length2 = dx * dx + dy * dy;
  const t = ((pointP.x - A.x) * dx + (pointP.y - A.y) * dy) / length2;
  const foot = {
    x: A.x + t * dx,
    y: A.y + t * dy,
  };

  const dirL = normalize({ x: dx, y: dy });

  const userLines = objects.filter(o => o.source === "user" && (o.type === "line" || o.type === "segment"));
  
  for (const line of userLines) {
    const p1 = line.points[0];
    const p2 = line.points[1];
    const dirUser = normalize({ x: p2.x - p1.x, y: p2.y - p1.y });
    
    // Check perpendicularity
    const dot = dotProduct(dirL, dirUser);
    if (Math.abs(dot) < EPSILON_ANGLE) {
      // It is perpendicular. Now check if it passes through P AND the foot
      if (line.type === "line") {
        // For infinite lines, just checking distance from points to the line is enough
        const distP = distancePointToInfiniteLine(pointP, p1, p2);
        const distFoot = distancePointToInfiniteLine(foot, p1, p2);
        if (distP < EPSILON_DIST && distFoot < EPSILON_DIST) {
           return { isSuccess: true, message: "성공!", score: calculateScore(stats, 4, 30) };
        }
      } else {
        // For segments, it must CONTAIN both P and the foot within its bounding segment
        const distP = distancePointToInfiniteLine(pointP, p1, p2);
        const distFoot = distancePointToInfiniteLine(foot, p1, p2);
        
        if (distP < EPSILON_DIST && distFoot < EPSILON_DIST) {
           // Ensure the segment is long enough to cover both
           const p1_p = distance(p1, pointP);
           const p2_p = distance(p2, pointP);
           const len = distance(p1, p2);
           const pOnSegment = Math.abs(p1_p + p2_p - len) < EPSILON_DIST;

           const p1_f = distance(p1, foot);
           const p2_f = distance(p2, foot);
           const footOnSegment = Math.abs(p1_f + p2_f - len) < EPSILON_DIST;

           if (pOnSegment && footOnSegment) {
             return { isSuccess: true, message: "성공!", score: calculateScore(stats, 4, 30) };
           }
        }
      }
    }
  }

  return { isSuccess: false, message: "점 P를 지나며 직선 l에 수직인 선분(또는 직선)을 작도하세요. (수선의 발 포함)" };
}

// Helper to get incenter
function getIncenter(A: {x: number, y: number}, B: {x: number, y: number}, C: {x: number, y: number}) {
  const a = distance(B, C);
  const b = distance(C, A);
  const c = distance(A, B);
  const p = a + b + c;
  
  return {
    x: (a * A.x + b * B.x + c * C.x) / p,
    y: (a * A.y + b * B.y + c * C.y) / p
  };
}

export function validateIncenter(
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats
): ChallengeValidationResult {
  const A = refs["A"]?.points[0];
  const B = refs["B"]?.points[0];
  const C = refs["C"]?.points[0];
  
  if (!A || !B || !C) return { isSuccess: false, message: "기본 꼭짓점이 없습니다." };
  
  const { EPSILON_DIST, EPSILON_ANGLE } = getEpsilons([A, B, C]);
  
  const incenter = getIncenter(A, B, C);
  
  // Angle bisector check
  const userLines = objects.filter(o => o.source === "user" && (o.type === "line" || o.type === "segment"));
  
  let validBisectors = 0;
  
  const checkBisector = (V: {x: number, y: number}, P1: {x: number, y: number}, P2: {x: number, y: number}) => {
    const dir1 = normalize({ x: P1.x - V.x, y: P1.y - V.y });
    const dir2 = normalize({ x: P2.x - V.x, y: P2.y - V.y });
    const bisectorDir = normalize({ x: dir1.x + dir2.x, y: dir1.y + dir2.y });
    
    for (const line of userLines) {
      const p1 = line.points[0];
      const p2 = line.points[1];
      
      // Does line pass near V?
      const distV = distancePointToInfiniteLine(V, p1, p2);
      let startsNearV = false;
      if (line.type === "segment") {
         startsNearV = distance(V, p1) < EPSILON_DIST || distance(V, p2) < EPSILON_DIST;
      } else {
         startsNearV = distV < EPSILON_DIST;
      }
      
      if (startsNearV) {
        // Is direction matching bisectorDir?
        const lineDir = normalize({ x: p2.x - p1.x, y: p2.y - p1.y });
        const dot = dotProduct(lineDir, bisectorDir);
        // It could be parallel or anti-parallel
        if (Math.abs(Math.abs(dot) - 1.0) < EPSILON_ANGLE) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkBisector(A, B, C)) validBisectors++;
  if (checkBisector(B, A, C)) validBisectors++;
  if (checkBisector(C, A, B)) validBisectors++;

  if (validBisectors < 2) {
    return { isSuccess: false, message: "두 개 이상의 각의 이등분선을 작도하여 교점(내심)을 찾아야 합니다." };
  }

  // Check if a point is placed at the incenter
  const userPoints = objects.filter(o => o.source === "user" && o.type === "point").flatMap(o => o.points || []);
  const foundIncenter = userPoints.some(p => distance(p, incenter) < EPSILON_DIST);

  if (!foundIncenter) {
    return { isSuccess: false, message: "각의 이등분선의 교점(내심)에 점을 찍어주세요." };
  }

  return { isSuccess: true, message: "성공!", score: calculateScore(stats, 4, 60) };
}

export function validateIncircle(
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats
): ChallengeValidationResult {
  const incenterResult = validateIncenter(objects, refs, stats);
  if (!incenterResult.isSuccess) {
    return incenterResult;
  }

  const A = refs["A"]?.points[0];
  const B = refs["B"]?.points[0];
  const C = refs["C"]?.points[0];
  
  if (!A || !B || !C) return { isSuccess: false, message: "기본 꼭짓점이 없습니다." };

  const { EPSILON_DIST, EPSILON_RADIUS } = getEpsilons([A, B, C]);
  
  const incenter = getIncenter(A, B, C);
  const a = distance(B, C);
  const b = distance(C, A);
  const c = distance(A, B);
  
  const cross = Math.abs(crossProduct({x: B.x - A.x, y: B.y - A.y}, {x: C.x - A.x, y: C.y - A.y}));
  const area = cross / 2;
  const r_true = 2 * area / (a + b + c);

  const userCircles = objects.filter(o => o.source === "user" && o.type === "circle");
  if (userCircles.length === 0) {
    return { isSuccess: false, message: "내접원을 작도해주세요." };
  }

  const lastCircle = userCircles[userCircles.length - 1];
  const O = lastCircle.points[0];
  const r = lastCircle.radius;

  if (!O || r === undefined) return { isSuccess: false, message: "원 데이터가 올바르지 않습니다." };

  if (distance(O, incenter) > EPSILON_DIST) {
    return { isSuccess: false, message: "원의 중심이 내심과 일치하지 않습니다." };
  }

  if (Math.abs(r - r_true) > EPSILON_RADIUS) {
    return { isSuccess: false, message: "내접원의 반지름이 정확하지 않습니다." };
  }

  return { isSuccess: true, message: "성공!", score: calculateScore(stats, 6, 90) };
}
