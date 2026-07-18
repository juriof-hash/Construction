import { Geometry } from "../types/geometry";
import { SeededRandom, safeGenerate, getDailySeed } from "./randomUtils";

// 외심의 좌표를 수학적으로 미리 계산 (추가적인 검증이나 확장 기능을 위해 제공)
export function computeCircumcenter(A: {x: number, y: number}, B: {x: number, y: number}, C: {x: number, y: number}) {
  const D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  const Ux = ((A.x*A.x + A.y*A.y) * (B.y - C.y) + (B.x*B.x + B.y*B.y) * (C.y - A.y) + (C.x*C.x + C.y*C.y) * (A.y - B.y)) / D;
  const Uy = ((A.x*A.x + A.y*A.y) * (C.x - B.x) + (B.x*B.x + B.y*B.y) * (A.x - C.x) + (C.x*C.x + C.y*C.y) * (B.x - A.x)) / D;
  return { x: Ux, y: Uy };
}

export function generateStage4_1Initial(): Geometry[] {
  const seed = getDailySeed();
  const rng = new SeededRandom(seed + 41);

  return safeGenerate(
    rng,
    (r, attempt) => {
      // 예각삼각형
      const ax = r.range(-50, 50);
      const ay = r.range(-150, -80);
      const bx = ax + r.range(-150, -50);
      const by = ay + r.range(150, 250);
      const cx = ax + r.range(50, 150);
      const cy = ay + r.range(150, 250);

      const A = { x: ax, y: ay };
      const B = { x: bx, y: by };
      const C = { x: cx, y: cy };

      // check if it's acute
      const a2 = Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2);
      const b2 = Math.pow(A.x - C.x, 2) + Math.pow(A.y - C.y, 2);
      const c2 = Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2);

      // In acute triangle, sum of squares of any two sides is greater than square of third side
      if (a2 + b2 <= c2 || b2 + c2 <= a2 || c2 + a2 <= b2) return null;

      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial", label: "AB" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial", label: "BC" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial", label: "CA" },
      ];
    },
    () => {
      const A = { x: 0, y: -120 };
      const B = { x: -100, y: 100 };
      const C = { x: 120, y: 80 };
      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial", label: "AB" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial", label: "BC" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial", label: "CA" },
      ];
    }
  );
}

export function generateStage4_2Initial(): Geometry[] {
  const seed = getDailySeed();
  const rng = new SeededRandom(seed + 42);

  return safeGenerate(
    rng,
    (r, attempt) => {
      // 둔각삼각형: 외심이 아래쪽 멀리 생기므로, 삼각형 자체를 위로 치우치게 배치
      const ax = r.range(-150, -50);
      const ay = r.range(-100, 0);
      const bx = ax + r.range(150, 250);
      const by = ay + r.range(-20, 20);
      
      // Obtuse angle at C
      const cx = ax + r.range(20, 80);
      const cy = ay + r.range(50, 100);

      const A = { x: ax, y: ay };
      const B = { x: bx, y: by };
      const C = { x: cx, y: cy };

      const a2 = Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2);
      const b2 = Math.pow(A.x - C.x, 2) + Math.pow(A.y - C.y, 2);
      const c2 = Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2);

      // Require exactly one obtuse angle
      const isObtuse = a2 + b2 < c2 || b2 + c2 < a2 || c2 + a2 < b2;
      if (!isObtuse) return null;

      // Ensure circumcenter is not insanely far (prevent bounds issues)
      const cc = computeCircumcenter(A, B, C);
      if (Math.hypot(cc.x, cc.y) > 600) return null;

      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial", label: "AB" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial", label: "BC" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial", label: "CA" },
      ];
    },
    () => {
      const A = { x: -120, y: -50 };
      const B = { x: 120, y: -50 };
      const C = { x: -80, y: 20 }; 
      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial", label: "AB" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial", label: "BC" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial", label: "CA" },
      ];
    }
  );
}

export function generateStage4_3Initial(): Geometry[] {
  const seed = getDailySeed();
  const rng = new SeededRandom(seed + 43);

  return safeGenerate(
    rng,
    (r, attempt) => {
      // 직각삼각형
      const ax = r.range(-150, -50);
      const ay = r.range(-150, -50);
      const w = r.range(150, 250);
      const h = r.range(150, 250);

      const A = { x: ax, y: ay };
      const B = { x: ax + w, y: ay + h };
      const C = { x: ax + w, y: ay }; // Right angle at C

      // Rotate the triangle so it's not axis-aligned
      const angle = r.range(0, Math.PI * 2);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const rotate = (pt: {x: number, y: number}) => ({
        x: pt.x * cosA - pt.y * sinA,
        y: pt.x * sinA + pt.y * cosA
      });

      const rA = rotate(A);
      const rB = rotate(B);
      const rC = rotate(C);

      return [
        { id: "ref-A", type: "point", pt: rA, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: rB, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: rC, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: rA, p2: rB, source: "initial", label: "AB" },
        { id: "ref-BC", type: "line", p1: rB, p2: rC, source: "initial", label: "BC" },
        { id: "ref-CA", type: "line", p1: rC, p2: rA, source: "initial", label: "CA" },
      ];
    },
    () => {
      const A = { x: -100, y: -100 };
      const B = { x: 100, y: 100 };
      const C = { x: 100, y: -100 };
      return [
        { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
        { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
        { id: "ref-C", type: "point", pt: C, source: "initial", label: "C" },
        { id: "ref-AB", type: "line", p1: A, p2: B, source: "initial", label: "AB" },
        { id: "ref-BC", type: "line", p1: B, p2: C, source: "initial", label: "BC" },
        { id: "ref-CA", type: "line", p1: C, p2: A, source: "initial", label: "CA" },
      ];
    }
  );
}
