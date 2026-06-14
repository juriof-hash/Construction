import React from 'react';
import { Geometry } from '../types/geometry';
import { describeArc } from '../utils/mathUtils';

export const ObjectLayer = ({ geometries }: { geometries: Geometry[] }) => {
  return (
    <g>
      {geometries.map(geom => {
        const isSelected = geom.selected;
        const color = isSelected ? '#ef4444' : '#1e293b';
        
        switch (geom.type) {
          case 'point':
            return (
              <circle key={geom.id} cx={geom.pt.x} cy={geom.pt.y} r={3} fill={color} />
            );
          case 'line':
            return (
              <line key={geom.id} x1={geom.p1.x} y1={geom.p1.y} x2={geom.p2.x} y2={geom.p2.y} stroke={color} strokeWidth={2} />
            );
          case 'circle':
            return (
              <circle key={geom.id} cx={geom.center.x} cy={geom.center.y} r={geom.r} fill="none" stroke={color} strokeWidth={2} />
            );
          case 'arc':
            return (
              <path key={geom.id} d={describeArc(geom.center.x, geom.center.y, geom.r, geom.startAngle, geom.sweepAngle)} fill="none" stroke={color} strokeWidth={2} />
            );
          default:
            return null;
        }
      })}
    </g>
  );
};
