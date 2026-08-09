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
  
  const userCircles = objects.filter(o => o.source === "user" && (o.type === "circle" || o.type === "arc"));
  if (userCircles.length < 2) {
    return { isSuccess: false, message: "컴퍼스를 2번 이상 사용하여 수선을 작도하기 위한 교점을 찾아야 합니다." };
  }
  
  const A = lineL.points[0];
  const B = lineL.points[1];
  
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
  
  const STRICT_EPSILON_DIST = 1.0;
  const STRICT_EPSILON_ANGLE = 0.01;

  for (const line of userLines) {
    const p1 = line.points[0];
    const p2 = line.points[1];
    const dirUser = normalize({ x: p2.x - p1.x, y: p2.y - p1.y });
    
    // Check perpendicularity
    const dot = dotProduct(dirL, dirUser);
    if (Math.abs(dot) < STRICT_EPSILON_ANGLE) {
      // It is perpendicular. Now check if it passes through P AND the foot
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

  return { isSuccess: false, message: "점 P를 지나며 직선 l에 수직인 선분(또는 직선)을 작도하세요. (눈대중이 아닌 교점 스냅 활용)" };
}
`;

code = code.replace(/export function validatePerpendicularLine\([\s\S]*?\n\}\n/m, replacement + '\n');
fs.writeFileSync('src/utils/stage5Validators.ts', code);
