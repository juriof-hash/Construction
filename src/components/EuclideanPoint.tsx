import React from "react";

export const EuclideanPoint = ({
  x,
  y,
  color = "#1e293b",
  snapped = false,
  preview = false,
}: {
  x: number;
  y: number;
  color?: string;
  snapped?: boolean;
  preview?: boolean;
}) => {
  const r = 3;
  const tickLen = 3;

  // If preview and snapped, we might want to highlight it.
  const displayColor = snapped ? "#eab308" : color;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className={preview ? "pointer-events-none" : ""}
    >
      {snapped && (
        <circle
          cx={0}
          cy={0}
          r={8}
          fill="none"
          stroke="#eab308"
          strokeWidth={1.5}
        />
      )}
      <circle
        cx={0}
        cy={0}
        r={r}
        fill="none"
        stroke={displayColor}
        strokeWidth={1.5}
      />
      <line
        x1={0}
        y1={-r}
        x2={0}
        y2={-r - tickLen}
        stroke={displayColor}
        strokeWidth={1.5}
      />
      <line
        x1={0}
        y1={r}
        x2={0}
        y2={r + tickLen}
        stroke={displayColor}
        strokeWidth={1.5}
      />
      <line
        x1={-r}
        y1={0}
        x2={-r - tickLen}
        y2={0}
        stroke={displayColor}
        strokeWidth={1.5}
      />
      <line
        x1={r}
        y1={0}
        x2={r + tickLen}
        y2={0}
        stroke={displayColor}
        strokeWidth={1.5}
      />
    </g>
  );
};
