import { Geometry } from "../types/geometry";

// 외심의 좌표를 수학적으로 미리 계산 (추가적인 검증이나 확장 기능을 위해 제공)
export function computeCircumcenter(A: {x: number, y: number}, B: {x: number, y: number}, C: {x: number, y: number}) {
  const D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  const Ux = ((A.x*A.x + A.y*A.y) * (B.y - C.y) + (B.x*B.x + B.y*B.y) * (C.y - A.y) + (C.x*C.x + C.y*C.y) * (A.y - B.y)) / D;
  const Uy = ((A.x*A.x + A.y*A.y) * (C.x - B.x) + (B.x*B.x + B.y*B.y) * (A.x - C.x) + (C.x*C.x + C.y*C.y) * (B.x - A.x)) / D;
  return { x: Ux, y: Uy };
}

export function generateStage4_1Initial(): Geometry[] {
  // 예각삼각형: 캔버스 중앙에 위치, 안전 여백 유지
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

export function generateStage4_2Initial(): Geometry[] {
  // 둔각삼각형: 외심이 아래쪽 멀리 생기므로, 삼각형 자체를 위로 치우치게 배치
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

export function generateStage4_3Initial(): Geometry[] {
  // 직각삼각형: 빗변이 중앙을 가로지르도록 대각선 배치
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
