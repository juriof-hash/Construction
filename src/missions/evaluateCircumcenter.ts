import { GeometryObject } from "../types/mission";
import { ChallengeValidationResult, PlayerStats } from "../types/challenge";
import { calculateScore } from "../data/stage1Validators";

function dist(p1: {x: number, y: number}, p2: {x: number, y: number}) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function evaluateCircumcenter(
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats,
  missionType: 'acute' | 'obtuse' | 'right'
): ChallengeValidationResult {
  const epsilon = 5; // [이유] 화면 픽셀 오차 판정의 관대함 부여
  
  const A = refs["A"]?.points[0];
  const B = refs["B"]?.points[0];
  const C = refs["C"]?.points[0];
  
  if (!A || !B || !C) return { isSuccess: false, message: "기본 꼭짓점이 없습니다." };

  const M_AB = { x: (A.x + B.x)/2, y: (A.y + B.y)/2 };
  const M_BC = { x: (B.x + C.x)/2, y: (B.y + C.y)/2 };
  const M_CA = { x: (C.x + A.x)/2, y: (C.y + A.y)/2 };

  // 사용자가 작도한 모든 점 추출
  const userPoints = objects
    .filter(o => o.source === "user" && o.type === "point")
    .flatMap(o => o.points || []);

  // [Condition 1: Construction Process Verification] - 부정 방지
  let foundMidpointsCount = 0;
  const foundMAB = userPoints.some(p => dist(p, M_AB) < epsilon);
  const foundMBC = userPoints.some(p => dist(p, M_BC) < epsilon);
  const foundMCA = userPoints.some(p => dist(p, M_CA) < epsilon);

  if (foundMAB) foundMidpointsCount++;
  if (foundMBC) foundMidpointsCount++;
  if (foundMCA) foundMidpointsCount++;

  let midpointsValid = false;
  if (missionType === 'right') {
    // 직각삼각형의 경우 빗변(가장 긴 변)의 중점을 찾았는지 확인
    const distAB = dist(A, B);
    const distBC = dist(B, C);
    const distCA = dist(C, A);
    const maxDist = Math.max(distAB, distBC, distCA);
    
    let hypMidpointFound = false;
    if (Math.abs(maxDist - distAB) < 0.1 && foundMAB) hypMidpointFound = true;
    if (Math.abs(maxDist - distBC) < 0.1 && foundMBC) hypMidpointFound = true;
    if (Math.abs(maxDist - distCA) < 0.1 && foundMCA) hypMidpointFound = true;
    
    midpointsValid = hypMidpointFound;
  } else {
    // 예각, 둔각 삼각형의 경우 2개 이상의 중점을 찾았는지 확인
    midpointsValid = foundMidpointsCount >= 2;
  }

  if (!midpointsValid) {
    if (missionType === 'right') {
      return { isSuccess: false, message: "빗변의 중점을 먼저 찾아야 합니다. (수직이등분선 활용)" };
    }
    return { isSuccess: false, message: "두 변 이상의 수직이등분선을 작도하여 교점(중점)을 먼저 찾아야 합니다." };
  }

  // [Condition 2: Final Result Verification]
  const userCircles = objects.filter(o => o.source === "user" && o.type === "circle");
  if (userCircles.length === 0) {
    return { isSuccess: false, message: "외접원을 작도해주세요." };
  }

  // 사용자가 마지막으로 그린 원을 정답으로 간주
  const lastCircle = userCircles[userCircles.length - 1];
  const O = lastCircle.points[0];
  const r = lastCircle.radius;

  if (!O || r === undefined) return { isSuccess: false, message: "원 데이터가 올바르지 않습니다." };

  // 세 꼭짓점을 모두 지나는지 검증
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
