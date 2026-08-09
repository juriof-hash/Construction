const fs = require('fs');

let code = fs.readFileSync('src/utils/stage5Validators.ts', 'utf8');

const replacement = `export function validateIncenter(
  objects: GeometryObject[],
  refs: Record<string, GeometryObject>,
  stats: PlayerStats
): ChallengeValidationResult {
  const A = refs["A"]?.points[0];
  const B = refs["B"]?.points[0];
  const C = refs["C"]?.points[0];
  
  if (!A || !B || !C) return { isSuccess: false, message: "기본 꼭짓점이 없습니다." };
  
  const userCircles = objects.filter(o => o.source === "user" && (o.type === "circle" || o.type === "arc"));
  if (userCircles.length < 2) {
    return { isSuccess: false, message: "컴퍼스를 이용하여 교점을 먼저 찾아야 합니다. (각의 이등분선 작도)" };
  }

  const incenter = getIncenter(A, B, C);
  
  // Angle bisector check
  const userLines = objects.filter(o => o.source === "user" && (o.type === "line" || o.type === "segment"));
  
  let validBisectors = 0;
  
  const STRICT_EPSILON_DIST = 1.0;
  const STRICT_EPSILON_ANGLE = 0.01;

  const checkBisector = (V: {x: number, y: number}, P1: {x: number, y: number}, P2: {x: number, y: number}) => {
    const dir1 = normalize({ x: P1.x - V.x, y: P1.y - V.y });
    const dir2 = normalize({ x: P2.x - V.x, y: P2.y - V.y });
    const bisectorDir = normalize({ x: dir1.x + dir2.x, y: dir1.y + dir2.y });
    
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

  if (checkBisector(A, B, C)) validBisectors++;
  if (checkBisector(B, A, C)) validBisectors++;
  if (checkBisector(C, A, B)) validBisectors++;

  if (validBisectors < 2) {
    return { isSuccess: false, message: "두 개 이상의 각의 이등분선을 작도하여 교점(내심)을 찾아야 합니다. (눈대중이 아닌 교점 스냅 활용)" };
  }

  const userPoints = objects.filter(o => o.source === "user" && o.type === "point").flatMap(o => o.points || []);
  const foundIncenter = userPoints.some(p => distance(p, incenter) < STRICT_EPSILON_DIST);
  
  if (!foundIncenter) {
    return { isSuccess: false, message: "각의 이등분선의 교점(내심)에 점을 찍어주세요." };
  }

  return { isSuccess: true, message: "성공!", score: calculateScore(stats, 4, 60) };
}
`;

code = code.replace(/export function validateIncenter\([\s\S]*?\n\}\n/m, replacement + '\n');
fs.writeFileSync('src/utils/stage5Validators.ts', code);
