const fs = require('fs');

let code = fs.readFileSync('src/utils/stage5Validators.ts', 'utf8');

const replacement = `export function validatePerpendicularLine(
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats
): ChallengeValidationResult {
  const lineL = refs["l"];
  const pointP = refs["P"]?.points[0];

  if (!lineL || !pointP) return { isSuccess: false, message: "기본 도형이 없습니다." };
  
  const A = lineL.points[0];
  const B = lineL.points[1];
  const STRICT_EPSILON_DIST = 1.0;
  const STRICT_EPSILON_ANGLE = 0.01;
  
  // [작도 과정 검증]: 사용자님이 제안한 완벽한 과정 검증
  let hasProperConstruction = false;
  const userCircles = objects.filter(o => o.source === "user" && (o.type === "circle" || o.type === "arc"));
  
  for (let i = 0; i < userCircles.length; i++) {
    for (let j = i + 1; j < userCircles.length; j++) {
      const c1 = userCircles[i];
      const c2 = userCircles[j];
      const m1 = c1.points[0];
      const m2 = c2.points[0];
      const r1 = c1.radius || 0;
      const r2 = c2.radius || 0;
      
      // 1. 두 원의 중심이 서로 달라야 함
      if (distance(m1, m2) < STRICT_EPSILON_DIST) continue;
      
      // 2. 두 원의 중심이 직선 l 위에 있는가? (직선 l 위의 교점을 이용했는지)
      const distM1_L = distancePointToInfiniteLine(m1, A, B);
      const distM2_L = distancePointToInfiniteLine(m2, A, B);
      if (distM1_L > STRICT_EPSILON_DIST || distM2_L > STRICT_EPSILON_DIST) continue;
      
      // 3. 두 원의 반지름이 같은가? (같은 반지름의 원으로 교점을 만들어야 수직이등분선이 됨)
      if (Math.abs(r1 - r2) > STRICT_EPSILON_DIST) continue;
      
      // 4. 두 원의 중심이 P로부터 거리가 같은가? (P를 지나는 수직이등분선을 만들기 위한 필수 조건)
      const distP_M1 = distance(pointP, m1);
      const distP_M2 = distance(pointP, m2);
      if (Math.abs(distP_M1 - distP_M2) > STRICT_EPSILON_DIST) continue;
      
      // 5. 두 원이 만나는가? (반지름의 합이 중심거리보다 커야 교점이 발생함)
      if (distance(m1, m2) > r1 + r2) continue;
      
      hasProperConstruction = true;
      break;
    }
    if (hasProperConstruction) break;
  }
  
  if (!hasProperConstruction) {
    return { isSuccess: false, message: "정확한 작도 순서를 따라주세요: 직선 위의 두 교점을 중심으로 반지름이 같은 두 원을 그려야 합니다." };
  }

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

  // [최종 결과 검증]: 그려진 선분이 P와 교점(수선의 발)을 지나는지 확인
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
`;

code = code.replace(/export function validatePerpendicularLine\([\s\S]*?\n\}\n/m, replacement + '\n');
fs.writeFileSync('src/utils/stage5Validators.ts', code);
