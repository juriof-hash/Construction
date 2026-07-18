import { Geometry, Point2D } from "../types/geometry";
import { SeededRandom, safeGenerate, getDailySeed } from "./randomUtils";

// 통합된 검증 함수: 삼각형의 유효성 (각도, 길이, 부등변) 검사
function isValidConfiguration(A: Point2D, B: Point2D, C: Point2D): boolean {
  const a = Math.hypot(B.x - C.x, B.y - C.y);
  const b = Math.hypot(A.x - C.x, A.y - C.y);
  const c = Math.hypot(A.x - B.x, A.y - B.y);
  
  if (a === 0 || b === 0 || c === 0) return false;

  const angleA = (Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180) / Math.PI;
  const angleB = (Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180) / Math.PI;
  const angleC = (Math.acos((a * a + b * b - c * c) / (2 * a * b)) * 180) / Math.PI;
  
  if (isNaN(angleA) || isNaN(angleB) || isNaN(angleC)) return false;

  // 1. Min/Max Angle Constraint
  if (angleA < 25 || angleA > 140) return false;
  if (angleB < 25 || angleB > 140) return false;
  if (angleC < 25 || angleC > 140) return false;

  // 2. Scalene Constraint (At least 5% of max side difference between any two sides)
  const sides = [a, b, c].sort((x, y) => x - y);
  const maxSide = sides[2];
  const diffThreshold = maxSide * 0.05;
  
  if (sides[1] - sides[0] < diffThreshold) return false;
  if (sides[2] - sides[1] < diffThreshold) return false;

  // 3. Min Distance Constraint
  // (Safe zone is handled by the random bounds in the generator itself)
  if (sides[0] < 30) return false;

  return true;
}

function generateValidTriangle(r: SeededRandom): [Point2D, Point2D, Point2D] | null {
  const ax = r.range(-350, -150);
  const ay = r.range(-100, 100);
  const bx = ax + r.range(100, 200);
  const by = ay + r.range(-50, 50);
  const cx = ax + r.range(50, 150);
  const cy = ay + r.range(80, 200);

  const A = { x: ax, y: ay };
  const B = { x: bx, y: by };
  const C = { x: cx, y: cy };

  if (!isValidConfiguration(A, B, C)) return null;

  return [A, B, C];
}

const fallbackTriangle = (): [Point2D, Point2D, Point2D] => [
  { x: -300, y: 0 },
  { x: -150, y: 0 },
  { x: -200, y: 150 }
];

export const generateMission3_1 = (): Geometry[] => {
  const seed = getDailySeed();
  const rng = new SeededRandom(seed + 31);

  return safeGenerate(
    rng,
    (r, attempt) => {
      const tri = generateValidTriangle(r);
      if (!tri) return null;
      const [A, B, C] = tri;

      const px = r.range(50, 150);
      const py = r.range(-50, 50);
      const P: Point2D = { x: px, y: py };

      const angle = r.range(0, Math.PI * 2);
      const len = r.range(200, 300);
      const P_end: Point2D = { x: px + Math.cos(angle) * len, y: py + Math.sin(angle) * len };

      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial", label: "AB" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial", label: "BC" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial", label: "CA" },
        { id: "ref-P", type: "point", pt: P, source: "initial", label: "P" },
        { id: "ref-L", type: "line", p1: P, p2: P_end, source: "initial", label: "L" },
      ];
    },
    () => {
      const [A, B, C] = fallbackTriangle();
      const P = { x: 100, y: 0 };
      const P_end = { x: 300, y: 0 };
      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial", label: "AB" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial", label: "BC" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial", label: "CA" },
        { id: "ref-P", type: "point", pt: P, source: "initial", label: "P" },
        { id: "ref-L", type: "line", p1: P, p2: P_end, source: "initial", label: "L" },
      ];
    }
  );
};

export const generateMission3_2 = (): Geometry[] => {
  const seed = getDailySeed();
  const rng = new SeededRandom(seed + 32);

  return safeGenerate(
    rng,
    (r, attempt) => {
      const tri = generateValidTriangle(r);
      if (!tri) return null;
      const [A, B, C] = tri;

      const ox = r.range(100, 200);
      const oy = r.range(-50, 50);
      const O: Point2D = { x: ox, y: oy };

      const angle = r.range(0, Math.PI * 2);
      const len = r.range(200, 300);
      const O_end: Point2D = { x: ox + Math.cos(angle) * len, y: oy + Math.sin(angle) * len };

      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial", label: "AB" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial", label: "BC" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial", label: "CA" },
        { id: "ref-O", type: "point", pt: O, source: "initial", label: "O" },
        { id: "ref-L", type: "line", p1: O, p2: O_end, source: "initial", label: "L" },
      ];
    },
    () => {
      const [A, B, C] = fallbackTriangle();
      const O = { x: 100, y: 0 };
      const O_end = { x: 300, y: 0 };
      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial", label: "AB" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial", label: "BC" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial", label: "CA" },
        { id: "ref-O", type: "point", pt: O, source: "initial", label: "O" },
        { id: "ref-L", type: "line", p1: O, p2: O_end, source: "initial", label: "L" },
      ];
    }
  );
};

export const generateMission3_3 = (): Geometry[] => {
  const seed = getDailySeed();
  const rng = new SeededRandom(seed + 33);

  return safeGenerate(
    rng,
    (r, attempt) => {
      const tri = generateValidTriangle(r);
      if (!tri) return null;
      const [A, B, C] = tri;

      const ox = r.range(50, 150);
      const oy = r.range(-50, 50);

      const W = Math.hypot(A.x - B.x, A.y - B.y);

      const MathPI2 = Math.PI * 2;
      const angle = r.range(0, MathPI2);
      const O: Point2D = { x: ox, y: oy };
      const O_B: Point2D = { x: ox + Math.cos(angle) * W, y: oy + Math.sin(angle) * W };
      const O_end: Point2D = { x: ox + Math.cos(angle) * 400, y: oy + Math.sin(angle) * 400 };

      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial", label: "AB" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial", label: "BC" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial", label: "CA" },
        { id: "ref-A_prime", type: "point", pt: O, source: "initial", label: "A'" },
        { id: "ref-B_prime", type: "point", pt: O_B, source: "initial", label: "B'" },
        { id: "ref-L", type: "line", p1: O, p2: O_end, source: "initial", label: "L" },
      ];
    },
    () => {
      const [A, B, C] = fallbackTriangle();
      const W = Math.hypot(A.x - B.x, A.y - B.y);
      const O = { x: 50, y: 0 };
      const O_B = { x: 50 + W, y: 0 };
      const O_end = { x: 450, y: 0 };

      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial", label: "AB" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial", label: "BC" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial", label: "CA" },
        { id: "ref-A_prime", type: "point", pt: O, source: "initial", label: "A'" },
        { id: "ref-B_prime", type: "point", pt: O_B, source: "initial", label: "B'" },
        { id: "ref-L", type: "line", p1: O, p2: O_end, source: "initial", label: "L" },
      ];
    }
  );
};
