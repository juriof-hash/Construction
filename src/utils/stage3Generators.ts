import { Geometry, Point2D } from "../types/geometry";

const r = (min: number, max: number) => Math.random() * (max - min) + min;

// 삼각형 내각 제한 (너무 뾰족하거나 평평한 삼각형 금지)
function validateTriangleAngles(A: Point2D, B: Point2D, C: Point2D): boolean {
  const a = Math.hypot(B.x - C.x, B.y - C.y);
  const b = Math.hypot(A.x - C.x, A.y - C.y);
  const c = Math.hypot(A.x - B.x, A.y - B.y);

  if (a === 0 || b === 0 || c === 0) return false;

  const angleA = (Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180) / Math.PI;
  const angleB = (Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180) / Math.PI;
  const angleC = (Math.acos((a * a + b * b - c * c) / (2 * a * b)) * 180) / Math.PI;

  if (isNaN(angleA) || isNaN(angleB) || isNaN(angleC)) return false;
  
  if (angleA < 25 || angleA > 140) return false;
  if (angleB < 25 || angleB > 140) return false;
  if (angleC < 25 || angleC > 140) return false;

  return true;
}

function generateValidTriangle(): [Point2D, Point2D, Point2D] {
  let A: Point2D, B: Point2D, C: Point2D;
  do {
    const ax = r(-350, -150);
    const ay = r(-100, 100);
    const bx = ax + r(100, 200);
    const by = ay + r(-50, 50);
    const cx = ax + r(50, 150);
    const cy = ay + r(80, 200);

    A = { x: ax, y: ay };
    B = { x: bx, y: by };
    C = { x: cx, y: cy };
  } while (!validateTriangleAngles(A, B, C));

  return [A, B, C];
}

export const generateMission3_1 = (): Geometry[] => {
  const [A, B, C] = generateValidTriangle();

  const px = r(50, 150);
  const py = r(-50, 50);
  const P: Point2D = { x: px, y: py };

  const angle = r(0, Math.PI * 2);
  const len = r(200, 300);
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
};

export const generateMission3_2 = (): Geometry[] => {
  const [A, B, C] = generateValidTriangle();

  const ox = r(100, 200);
  const oy = r(-50, 50);
  const O: Point2D = { x: ox, y: oy };

  const angle = r(0, Math.PI * 2);
  const len = r(200, 300);
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
};

export const generateMission3_3 = (): Geometry[] => {
  const [A, B, C] = generateValidTriangle();

  const ox = r(50, 150);
  const oy = r(-50, 50);

  const W = Math.hypot(A.x - B.x, A.y - B.y);

  const MathPI2 = Math.PI * 2;
  const angle = r(0, MathPI2);
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
};
