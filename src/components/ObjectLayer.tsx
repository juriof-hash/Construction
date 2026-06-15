import React from "react";
import { Geometry } from "../types/geometry";
import { describeArc } from "../utils/mathUtils";
import { EuclideanPoint } from "./EuclideanPoint";

export const ObjectLayer = ({ geometries }: { geometries: Geometry[] }) => {
  return (
    <g>
      {geometries.map((geom) => {
        const isSelected = geom.selected;
        const color = isSelected ? "#ef4444" : "#1e293b";

        switch (geom.type) {
          case "point":
            return (
              <g key={geom.id}>
                <EuclideanPoint x={geom.pt.x} y={geom.pt.y} color={color} />
                {geom.label && (
                  <text
                    x={geom.pt.x + 8}
                    y={geom.pt.y - 8}
                    fontSize={20}
                    fill="#334155"
                    fontWeight="bold"
                    className="select-none pointer-events-none drop-shadow-sm"
                  >
                    {geom.label}
                  </text>
                )}
              </g>
            );
          case "line":
            return (
              <g key={geom.id}>
                <line
                  x1={geom.p1.x}
                  y1={geom.p1.y}
                  x2={geom.p2.x}
                  y2={geom.p2.y}
                  stroke={color}
                  strokeWidth={2}
                />
              </g>
            );
          case "circle":
            return (
              <g key={geom.id}>
                <circle
                  cx={geom.center.x}
                  cy={geom.center.y}
                  r={geom.r}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                />
              </g>
            );
          case "arc":
            return (
              <g key={geom.id}>
                <path
                  d={describeArc(
                    geom.center.x,
                    geom.center.y,
                    geom.r,
                    geom.startAngle,
                    geom.sweepAngle,
                  )}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                />
              </g>
            );
          default:
            return null;
        }
      })}
    </g>
  );
};
