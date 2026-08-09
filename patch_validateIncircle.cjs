const fs = require('fs');

let code = fs.readFileSync('src/utils/stage5Validators.ts', 'utf8');

const replacement = `export function validateIncircle(
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

  const incenter = getIncenter(A, B, C);
  const a = distance(B, C);
  const b = distance(C, A);
  const c = distance(A, B);
  
  const cross = Math.abs(crossProduct({x: B.x - A.x, y: B.y - A.y}, {x: C.x - A.x, y: C.y - A.y}));
  const area = cross / 2;
  const r_true = 2 * area / (a + b + c);

  const userCircles = objects.filter(o => o.source === "user" && o.type === "circle");
  
  // Find the incircle among user circles
  const STRICT_EPSILON = 1.0;
  
  const incircle = userCircles.find(circle => {
     const O = circle.points[0];
     const r = circle.radius;
     if (!O || r === undefined) return false;
     return distance(O, incenter) < STRICT_EPSILON && Math.abs(r - r_true) < STRICT_EPSILON;
  });

  if (!incircle) {
    return { isSuccess: false, message: "반지름이 정확한 내접원을 작도해주세요. (수선을 내려 접점을 찾고 스냅하세요)" };
  }

  return { isSuccess: true, message: "성공!", score: calculateScore(stats, 6, 90) };
}
`;

code = code.replace(/export function validateIncircle\([\s\S]*?\n\}\n/m, replacement + '\n');
fs.writeFileSync('src/utils/stage5Validators.ts', code);
