const fs = require('fs');

const code = `import { GeometryObject } from "../types/mission";
import { ChallengeValidationResult, PlayerStats } from "../types/challenge";
import { calculateScore } from "../data/stage1Validators";
import { distancePointToInfiniteLine } from "../utils/geoGraphValidation";
import { normalize, dotProduct } from "../utils/mathUtils";

function dist(p1: {x: number, y: number}, p2: {x: number, y: number}) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function evaluateCircumcenter(
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats,
  missionType: 'acute' | 'obtuse' | 'right'
): ChallengeValidationResult {
  const epsilon = 10; // [이유] 화면 픽셀 오차 판정의 관대함 부여
  
  const A = refs["A"]?.points[0];
  const B = refs["B"]?.points[0];
  const C = refs["C"]?.points[0];
  
  if (!A || !B || !C) return { isSuccess: false, message: "기본 꼭짓점이 없습니다." };

  const M_AB = { x: (A.x + B.x)/2, y: (A.y + B.y)/2 };
  const M_BC = { x: (B.x + C.x)/2, y: (B.y + C.y)/2 };
  const M_CA = { x: (C.x + A.x)/2, y: (C.y + A.y)/2 };

  const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  const ux = ((A.x*A.x + A.y*A.y) * (B.y - C.y) + (B.x*B.x + B.y*B.y) * (C.y - A.y) + (C.x*C.x + C.y*C.y) * (A.y - B.y)) / d;
  const uy = ((A.x*A.x + A.y*A.y) * (C.x - B.x) + (B.x*B.x + B.y*B.y) * (A.x - C.x) + (C.x*C.x + C.y*C.y) * (B.x - A.x)) / d;
  const O_true = { x: ux, y: uy };

  const userLines = objects.filter(o => o.source === "user" && (o.type === "line" || o.type === "segment"));

  const isPerpBisector = (M: {x: number, y: number}, p1: {x: number, y: number}, p2: {x: number, y: number}) => {
     const dirSide = normalize({ x: p2.x - p1.x, y: p2.y - p1.y });
     
     for (const line of userLines) {
        const lp1 = line.points[0];
        const lp2 = line.points[1];
        
        const distM = distancePointToInfiniteLine(M, lp1, lp2);
        const dirLine = normalize({ x: lp2.x - lp1.x, y: lp2.y - lp1.y });
        const dot = dotProduct(dirSide, dirLine);
        
        if (distM < epsilon && Math.abs(dot) < 0.05) {
           return true;
        }
     }
     return false;
  };

  const hasPerpAB = isPerpBisector(M_AB, A, B);
  const hasPerpBC = isPerpBisector(M_BC, B, C);
  const hasPerpCA = isPerpBisector(M_CA, C, A);

  let bisectorsCount = 0;
  if (hasPerpAB) bisectorsCount++;
  if (hasPerpBC) bisectorsCount++;
  if (hasPerpCA) bisectorsCount++;

  let bisectorsValid = false;
  if (missionType === 'right') {
    const distAB = dist(A, B);
    const distBC = dist(B, C);
    const distCA = dist(C, A);
    const maxDist = Math.max(distAB, distBC, distCA);
    
    let hypBisectorFound = false;
    if (Math.abs(maxDist - distAB) < 0.1 && hasPerpAB) hypBisectorFound = true;
    if (Math.abs(maxDist - distBC) < 0.1 && hasPerpBC) hypBisectorFound = true;
    if (Math.abs(maxDist - distCA) < 0.1 && hasPerpCA) hypBisectorFound = true;
    
    bisectorsValid = hypBisectorFound || (bisectorsCount >= 2);
  } else {
    bisectorsValid = bisectorsCount >= 2;
  }

  const userPoints = objects.filter(o => o.source === "user" && o.type === "point").flatMap(o => o.points || []);
  const foundCircumcenter = userPoints.some(p => dist(p, O_true) < epsilon);

  if (!bisectorsValid && !foundCircumcenter) {
    if (missionType === 'right') {
      return { isSuccess: false, message: "빗변의 수직이등분선을 작도하여 빗변의 중점을 찾으세요." };
    }
    return { isSuccess: false, message: "두 변 이상의 수직이등분선을 작도하여 교점(외심)을 먼저 찾아야 합니다." };
  }

  const userCircles = objects.filter(o => o.source === "user" && o.type === "circle");
  if (userCircles.length === 0) {
    return { isSuccess: false, message: "외심을 중심으로 하는 외접원을 작도해주세요." };
  }

  const lastCircle = userCircles[userCircles.length - 1];
  const O = lastCircle.points[0];
  const r = lastCircle.radius;
  if (!O || r === undefined) return { isSuccess: false, message: "원 데이터가 올바르지 않습니다." };

  const passA = Math.abs(dist(O, A) - r) < epsilon;
  const passB = Math.abs(dist(O, B) - r) < epsilon;
  const passC = Math.abs(dist(O, C) - r) < epsilon;

  if (passA && passB && passC) {
    return { 
       isSuccess: true, 
       message: "성공!",
       score: calculateScore(stats, 4, 60)
    };
  } else {
    return { isSuccess: false, message: "외접원이 세 꼭짓점 A, B, C를 모두 정확히 지나야 합니다." };
  }
}
`;
fs.writeFileSync('src/missions/evaluateCircumcenter.ts', code);
