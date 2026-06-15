import React from "react";
import { Point2D } from "../types/geometry";

export const CompassVisual = ({
  needlePt,
  pencilPt,
}: {
  needlePt: Point2D;
  pencilPt: Point2D;
}) => {
  const dx = pencilPt.x - needlePt.x;
  const dy = pencilPt.y - needlePt.y;
  const d = Math.hypot(dx, dy);

  if (d < 0.1) return null;

  const mx = (needlePt.x + pencilPt.x) / 2;
  const my = (needlePt.y + pencilPt.y) / 2;

  // Normalized perpendicular vector
  const nx = -dy / d;
  const ny = dx / d;

  // Compass legs form an isosceles triangle
  const halfD = d / 2;
  const L = Math.max(d * 0.8, 100);
  const h = Math.sqrt(L * L - halfD * halfD);

  const hx = mx + nx * h;
  const hy = my + ny * h;

  return (
    <g className="pointer-events-none drop-shadow-md">
      {/* Needle leg */}
      <line
        x1={hx}
        y1={hy}
        x2={needlePt.x}
        y2={needlePt.y}
        stroke="#94a3b8"
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* Needle tip */}
      <line
        x1={needlePt.x}
        y1={needlePt.y}
        x2={needlePt.x + (hx - needlePt.x) * 0.15}
        y2={needlePt.y + (hy - needlePt.y) * 0.15}
        stroke="#cbd5e1"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Pencil leg */}
      <line
        x1={hx}
        y1={hy}
        x2={pencilPt.x}
        y2={pencilPt.y}
        stroke="#475569"
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* Pencil tip (wood part) */}
      <line
        x1={pencilPt.x + (hx - pencilPt.x) * 0.05}
        y1={pencilPt.y + (hy - pencilPt.y) * 0.05}
        x2={pencilPt.x + (hx - pencilPt.x) * 0.2}
        y2={pencilPt.y + (hy - pencilPt.y) * 0.2}
        stroke="#fcd34d"
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* Pencil lead */}
      <line
        x1={pencilPt.x}
        y1={pencilPt.y}
        x2={pencilPt.x + (hx - pencilPt.x) * 0.05}
        y2={pencilPt.y + (hy - pencilPt.y) * 0.05}
        stroke="#334155"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Hinge */}
      <circle
        cx={hx}
        cy={hy}
        r={8}
        fill="#64748b"
        stroke="#cbd5e1"
        strokeWidth={1.5}
      />
      <circle cx={hx} cy={hy} r={3} fill="#cbd5e1" />
    </g>
  );
};
