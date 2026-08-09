import { GeometryObject } from "../types/mission";
import { ChallengeValidationResult, PlayerStats } from "../types/challenge";
import { calculateScore } from "../data/stage1Validators";
import { distance, dotProduct, normalize, crossProduct } from "./mathUtils";
import { distancePointToInfiniteLine } from "./geoGraphValidation";

const STRICT_EPSILON_DIST = 1.0;
const STRICT_EPSILON_ANGLE = 0.01;

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

function checkPerpendicularConstruction(P: {x:number, y:number}, A: {x:number, y:number}, B: {x:number, y:number}, objects: GeometryObject[]) {
  const userCircles = objects.filter(o => o.source === "user" && (o.type === "circle" || o.type === "arc"));
  for (let i = 0; i < userCircles.length; i++) {
    for (let j = i + 1; j < userCircles.length; j++) {
      const c1 = userCircles[i];
      const c2 = userCircles[j];
      const m1 = c1.points[0];
      const m2 = c2.points[0];
      const r1 = c1.radius || 0;
      const r2 = c2.radius || 0;

      if (distance(m1, m2) < STRICT_EPSILON_DIST) continue;
      if (distancePointToInfiniteLine(m1, A, B) > STRICT_EPSILON_DIST) continue;
      if (distancePointToInfiniteLine(m2, A, B) > STRICT_EPSILON_DIST) continue;
      if (Math.abs(r1 - r2) > STRICT_EPSILON_DIST) continue;
      if (Math.abs(distance(P, m1) - distance(P, m2)) > STRICT_EPSILON_DIST) continue;
      if (distance(m1, m2) > r1 + r2) continue;

      return true;
    }
  }
  return false;
}

function checkAngleBisectorConstruction(V: {x:number, y:number}, P1: {x:number, y:number}, P2: {x:number, y:number}, objects: GeometryObject[]) {
  const userCircles = objects.filter(o => o.source === "user" && (o.type === "circle" || o.type === "arc"));
  for (let i = 0; i < userCircles.length; i++) {
    for (let j = i + 1; j < userCircles.length; j++) {
      const c1 = userCircles[i];
      const c2 = userCircles[j];
      const m1 = c1.points[0];
      const m2 = c2.points[0];
      const r1 = c1.radius || 0;
      const r2 = c2.radius || 0;

      if (distance(m1, m2) < STRICT_EPSILON_DIST) continue;
      if (Math.abs(r1 - r2) > STRICT_EPSILON_DIST) continue;

      const checkOnRay = (M: {x:number, y:number}, origin: {x:number, y:number}, target: {x:number, y:number}) => {
         const distToLine = distancePointToInfiniteLine(M, origin, target);
         const dirTarget = normalize({x: target.x - origin.x, y: target.y - origin.y});
         const dirM = normalize({x: M.x - origin.x, y: M.y - origin.y});
         return distToLine < STRICT_EPSILON_DIST && dotProduct(dirTarget, dirM) > 0.99;
      };

      const m1On1 = checkOnRay(m1, V, P1);
      const m2On2 = checkOnRay(m2, V, P2);
      const m1On2 = checkOnRay(m1, V, P2);
      const m2On1 = checkOnRay(m2, V, P1);

      if ((m1On1 && m2On2) || (m1On2 && m2On1)) {
         if (Math.abs(distance(V, m1) - distance(V, m2)) < STRICT_EPSILON_DIST) {
             if (distance(m1, m2) <= r1 + r2) {
                 return true;
             }
         }
      }
    }
  }
  return false;
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

  if (!checkPerpendicularConstruction(pointP, A, B, objects)) {
    return { isSuccess: false, message: "정확한 작도 순서를 따라주세요: 직선 위의 두 교점을 중심으로 반지름이 같은 두 원을 그려야 합니다." };
  }

  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const length2 = dx * dx + dy * dy;
  const t = ((pointP.x - A.x) * dx + (pointP.y - A.y) * dy) / length2;
  const foot = { x: A.x + t * dx, y: A.y + t * dy };

  const dirL = normalize({ x: dx, y: dy });
  const userLines = objects.filter(o => o.source === "user" && (o.type === "line" || o.type === "segment"));

  for (const line of userLines) {
    const p1 = line.points[0];
    const p2 = line.points[1];
    const dirUser = normalize({ x: p2.x - p1.x, y: p2.y - p1.y });
    
    const dot = dotProduct(dirL, dirUser);
    if (Math.abs(dot) < STRICT_EPSILON_ANGLE) {
      if (line.type === "line") {
        const distP = distancePointToInfiniteLine(pointP, p1, p2);
        const distFoot = distancePointToInfiniteLine(foot, p1, p2);
        if (distP < STRICT_EPSILON_DIST && distFoot < STRICT_EPSILON_DIST) {
           return { isSuccess: true, message: "성공!", score: calculateScore(stats, 4, 30) };
        }
      } else {
        const distP = distancePointToInfiniteLine(pointP, p1, p2);
        const distFoot = distancePointToInfiniteLine(foot, p1, p2);
        
        if (distP < STRICT_EPSILON_DIST && distFoot < STRICT_EPSILON_DIST) {
           const p1_p = distance(p1, pointP);
           const p2_p = distance(p2, pointP);
           const len = distance(p1, p2);
           const pOnSegment = Math.abs(p1_p + p2_p - len) < STRICT_EPSILON_DIST;

           const p1_f = distance(p1, foot);
           const p2_f = distance(p2, foot);
           const footOnSegment = Math.abs(p1_f + p2_f - len) < STRICT_EPSILON_DIST;

           if (pOnSegment && footOnSegment) {
             return { isSuccess: true, message: "성공!", score: calculateScore(stats, 4, 30) };
           }
        }
      }
    }
  }

  return { isSuccess: false, message: "마지막으로 교점과 점 P를 연결하는 선분/직선을 작도해주세요." };
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
  
  let validBisectors = 0;
  
  const checkBisectorLine = (V: {x:number, y:number}, P1: {x:number, y:number}, P2: {x:number, y:number}) => {
    const dir1 = normalize({ x: P1.x - V.x, y: P1.y - V.y });
    const dir2 = normalize({ x: P2.x - V.x, y: P2.y - V.y });
    const bisectorDir = normalize({ x: dir1.x + dir2.x, y: dir1.y + dir2.y });
    
    const userLines = objects.filter(o => o.source === "user" && (o.type === "line" || o.type === "segment"));
    for (const line of userLines) {
      const p1 = line.points[0];
      const p2 = line.points[1];
      
      const distV = distancePointToInfiniteLine(V, p1, p2);
      let startsNearV = false;
      if (line.type === "segment") {
         startsNearV = distance(V, p1) < STRICT_EPSILON_DIST || distance(V, p2) < STRICT_EPSILON_DIST;
      } else {
         startsNearV = distV < STRICT_EPSILON_DIST;
      }
      
      if (startsNearV) {
        const lineDir = normalize({ x: p2.x - p1.x, y: p2.y - p1.y });
        const dot = dotProduct(lineDir, bisectorDir);
        if (Math.abs(Math.abs(dot) - 1.0) < STRICT_EPSILON_ANGLE) {
          return true;
        }
      }
    }
    return false;
  };

  const hasProcessA = checkAngleBisectorConstruction(A, B, C, objects);
  const hasProcessB = checkAngleBisectorConstruction(B, A, C, objects);
  const hasProcessC = checkAngleBisectorConstruction(C, A, B, objects);

  const hasLineA = checkBisectorLine(A, B, C);
  const hasLineB = checkBisectorLine(B, A, C);
  const hasLineC = checkBisectorLine(C, A, B);

  if (hasProcessA && hasLineA) validBisectors++;
  if (hasProcessB && hasLineB) validBisectors++;
  if (hasProcessC && hasLineC) validBisectors++;

  if (validBisectors < 2) {
    return { isSuccess: false, message: "두 개 이상의 각의 이등분선을 올바른 작도법으로 그려 교점(내심)을 찾아야 합니다." };
  }

  const incenter = getIncenter(A, B, C);
  const userPoints = objects.filter(o => o.source === "user" && o.type === "point").flatMap(o => o.points || []);
  const foundIncenter = userPoints.some(p => distance(p, incenter) < STRICT_EPSILON_DIST);
  
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
  // 1. 내심 작도 확인
  const incenterResult = validateIncenter(objects, refs, stats);
  if (!incenterResult.isSuccess) {
    return incenterResult;
  }

  const A = refs["A"]?.points[0];
  const B = refs["B"]?.points[0];
  const C = refs["C"]?.points[0];
  
  if (!A || !B || !C) return { isSuccess: false, message: "기본 꼭짓점이 없습니다." };

  const incenter = getIncenter(A, B, C);
  const a = distance(B, C);
  const b = distance(C, A);
  const c = distance(A, B);
  
  // 2. 내심에서 변에 내린 수선 작도 확인
  const perpAB = checkPerpendicularConstruction(incenter, A, B, objects);
  const perpBC = checkPerpendicularConstruction(incenter, B, C, objects);
  const perpCA = checkPerpendicularConstruction(incenter, C, A, objects);

  if (!perpAB && !perpBC && !perpCA) {
     return { isSuccess: false, message: "내심에서 삼각형의 한 변에 내린 수선을 작도하여 내접원의 반지름(접점)을 찾아야 합니다." };
  }

  const cross = Math.abs(crossProduct({x: B.x - A.x, y: B.y - A.y}, {x: C.x - A.x, y: C.y - A.y}));
  const area = cross / 2;
  const r_true = 2 * area / (a + b + c);

  // 3. 내접원 확인
  const userCircles = objects.filter(o => o.source === "user" && o.type === "circle");
  
  const incircle = userCircles.find(circle => {
     const O = circle.points[0];
     const r = circle.radius;
     if (!O || r === undefined) return false;
     return distance(O, incenter) < STRICT_EPSILON_DIST && Math.abs(r - r_true) < STRICT_EPSILON_DIST;
  });

  if (!incircle) {
    return { isSuccess: false, message: "반지름이 정확한 내접원을 작도해주세요. (수선을 내려 접점을 찾고 스냅하세요)" };
  }

  return { isSuccess: true, message: "성공!", score: calculateScore(stats, 6, 90) };
}
