import React from "react";
import { Geometry, GeomId } from "../types/geometry";
import { describeArc } from "../utils/mathUtils";
import { EuclideanPoint } from "./EuclideanPoint";

export const ObjectLayer = ({ geometries, selectedId }: { geometries: Geometry[]; selectedId?: GeomId | null }) => {
  return (
    <g>
      {geometries.map((geom) => {
        const isSelected = geom.id === selectedId;
        const color = geom.style?.color || (geom.source === 'initial' ? "#64748b" : "#1e293b");
        const strokeWidth = geom.style?.strokeWidth || 2;
        
        let strokeDasharray = undefined;
        if (geom.style?.dashStyle === 'dashed') strokeDasharray = `${strokeWidth * 3},${strokeWidth * 3}`;
        if (geom.style?.dashStyle === 'dotted') strokeDasharray = `${strokeWidth},${strokeWidth * 2}`;

        const Glow = () => {
          if (!isSelected) return null;
          return <g className="pointer-events-none stroke-blue-400/30" strokeWidth={strokeWidth + 8} fill="none" strokeLinecap="round">
            {geom.type === 'line' && <line x1={geom.p1.x} y1={geom.p1.y} x2={geom.p2.x} y2={geom.p2.y} />}
            {geom.type === 'circle' && <circle cx={geom.center.x} cy={geom.center.y} r={geom.r} />}
            {geom.type === 'arc' && <path d={describeArc(geom.center.x, geom.center.y, geom.r, geom.startAngle, geom.sweepAngle)} />}
            {geom.type === 'point' && <circle cx={geom.pt.x} cy={geom.pt.y} r={8} fill="rgba(96, 165, 250, 0.3)" stroke="none" />}
          </g>;
        };

        switch (geom.type) {
          case "point":
            return (
              <g key={geom.id}>
                <Glow />
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
                <Glow />
                <line
                  x1={geom.p1.x}
                  y1={geom.p1.y}
                  x2={geom.p2.x}
                  y2={geom.p2.y}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeLinecap={geom.style?.dashStyle === 'dotted' ? 'round' : 'butt'}
                />
              </g>
            );
          case "circle":
            return (
              <g key={geom.id}>
                <Glow />
                <circle
                  cx={geom.center.x}
                  cy={geom.center.y}
                  r={geom.r}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeLinecap={geom.style?.dashStyle === 'dotted' ? 'round' : 'butt'}
                />
              </g>
            );
          case "arc":
            return (
              <g key={geom.id}>
                <Glow />
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
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeLinecap={geom.style?.dashStyle === 'dotted' ? 'round' : 'butt'}
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
