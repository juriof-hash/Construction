import { Geometry, Point2D } from "../types/geometry";

const r = (min: number, max: number) => Math.random() * (max - min) + min;

// 20~160도 사이의 각도 (라디안) 추출
function randomAngleRange() {
  const angleDeg = r(20, 160);
  return (angleDeg * Math.PI) / 180;
}

export const generateMission2_1 = (): Geometry[] => {
  // 각의 이등분선
  const vx = r(-50, 50);
  const vy = r(-50, 50);
  const V: Point2D = { x: vx, y: vy };

  const baseAngle = r(0, 2 * Math.PI);
  const sweepAngle = randomAngleRange();

  const len1 = r(150, 250);
  const len2 = r(150, 250);

  const A: Point2D = {
    x: vx + len1 * Math.cos(baseAngle),
    y: vy + len1 * Math.sin(baseAngle),
  };
  const B: Point2D = {
    x: vx + len2 * Math.cos(baseAngle + sweepAngle),
    y: vy + len2 * Math.sin(baseAngle + sweepAngle),
  };

  return [
    { id: "ref-V", type: "point", pt: V, source: "initial", label: "V" },
    { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
    { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
    {
      id: "ref-VA",
      type: "line",
      p1: V,
      p2: A,
      source: "initial",
      label: "VA",
    },
    {
      id: "ref-VB",
      type: "line",
      p1: V,
      p2: B,
      source: "initial",
      label: "VB",
    },
  ];
};

export const generateMission2_2 = (): Geometry[] => {
  // 크기가 같은 각의 작도 (좌측 원본, 우측 대상선)
  // 원본
  const vx = r(-250, -150);
  const vy = r(-100, 100);
  const V: Point2D = { x: vx, y: vy };

  const baseAngle1 = r(0, 2 * Math.PI);
  const sweepAngle1 = randomAngleRange();
  const len1 = r(100, 150);
  const len2 = r(100, 150);
  const A: Point2D = {
    x: vx + len1 * Math.cos(baseAngle1),
    y: vy + len1 * Math.sin(baseAngle1),
  };
  const B: Point2D = {
    x: vx + len2 * Math.cos(baseAngle1 + sweepAngle1),
    y: vy + len2 * Math.sin(baseAngle1 + sweepAngle1),
  };

  // 대상
  const ox = r(100, 200);
  const oy = r(-100, 100);
  const O: Point2D = { x: ox, y: oy };

  const baseAngle2 = r(0, 2 * Math.PI);
  const len3 = r(150, 200);
  const X: Point2D = {
    x: ox + len3 * Math.cos(baseAngle2),
    y: oy + len3 * Math.sin(baseAngle2),
  };

  return [
    { id: "ref-V", type: "point", pt: V, source: "initial", label: "V" },
    { id: "ref-A", type: "point", pt: A, source: "initial" },
    { id: "ref-B", type: "point", pt: B, source: "initial" },
    {
      id: "ref-VA",
      type: "line",
      p1: V,
      p2: A,
      source: "initial",
      label: "VA",
    },
    {
      id: "ref-VB",
      type: "line",
      p1: V,
      p2: B,
      source: "initial",
      label: "VB",
    },

    { id: "ref-O", type: "point", pt: O, source: "initial", label: "O" },
    { id: "ref-X", type: "point", pt: X, source: "initial" },
    {
      id: "ref-OX",
      type: "line",
      p1: O,
      p2: X,
      source: "initial",
      label: "OX",
    },
  ];
};

export const generateMission2_3 = (): Geometry[] => {
  // 평행선 작도
  const ax = r(-200, 0);
  const ay = r(50, 150);
  const bx = ax + r(150, 250);
  const by = ay + r(-150, 50);
  const A: Point2D = { x: ax, y: ay };
  const B: Point2D = { x: bx, y: by };

  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;

  const dist = r(100, 180) * (Math.random() < 0.5 ? 1 : -1);
  const projT = r(0.2, 0.8) * len;
  const P: Point2D = {
    x: ax + (dx / len) * projT + nx * dist,
    y: ay + (dy / len) * projT + ny * dist,
  };

  return [
    { id: "ref-A", type: "point", pt: A, source: "initial", label: "A" },
    { id: "ref-B", type: "point", pt: B, source: "initial", label: "B" },
    {
      id: "ref-AB",
      type: "line",
      p1: A,
      p2: B,
      source: "initial",
      label: "AB",
    },
    { id: "ref-P", type: "point", pt: P, source: "initial", label: "P" },
  ];
};
