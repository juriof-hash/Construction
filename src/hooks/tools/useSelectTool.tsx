import React, { useCallback } from 'react';
import { ToolHookResult } from '../../types/tool';
import { Geometry } from '../../types/geometry';
import { getWorldCoords } from '../../utils/svgUtils';
import { distance, pointToLineDistance } from '../../utils/challengeGeometry';

export const useSelectTool = (
  active: boolean,
  gRef: React.RefObject<SVGGElement | null>,
  dispatch: any,
  geometries: Geometry[],
  scale: number,
  setPopupPos: (pos: { x: number; y: number } | null) => void
): ToolHookResult => {

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!active) return;
    
    e.target.releasePointerCapture(e.pointerId);
    const { pt } = getWorldCoords(e, gRef);

    // Hitbox threshold (adaptive based on zoom, mobile friendly)
    // 20 pixels on screen
    const threshold = 20 / scale;

    let closestId: string | null = null;
    let minD = Infinity;

    // Traverse in reverse to pick top-most elements first
    for (let i = geometries.length - 1; i >= 0; i--) {
      const g = geometries[i];
      let d = Infinity;
      
      if (g.type === 'point') {
        d = distance(pt, g.pt);
      } else if (g.type === 'line') {
        const segLen = distance(g.p1, g.p2);
        if (segLen === 0) {
           d = distance(pt, g.p1);
        } else {
           const l2 = segLen * segLen;
           const t = Math.max(0, Math.min(1, ((pt.x - g.p1.x) * (g.p2.x - g.p1.x) + (pt.y - g.p1.y) * (g.p2.y - g.p1.y)) / l2));
           const proj = { x: g.p1.x + t * (g.p2.x - g.p1.x), y: g.p1.y + t * (g.p2.y - g.p1.y) };
           d = distance(pt, proj);
        }
      } else if (g.type === 'circle') {
        d = Math.abs(distance(pt, g.center) - g.r);
      } else if (g.type === 'arc') {
        // Approximate distance to arc
        const distToCenter = distance(pt, g.center);
        if (Math.abs(distToCenter - g.r) > threshold) {
          d = Infinity;
        } else {
          // Check if angle is within sweep
          const normalize = (a: number) => {
            let res = a % (2 * Math.PI);
            if (res < 0) res += 2 * Math.PI;
            return res;
          };
          const angle = normalize(Math.atan2(pt.y - g.center.y, pt.x - g.center.x));
          let sAngle = normalize(g.startAngle);
          let eAngle = normalize(g.startAngle + g.sweepAngle);
          
          if (g.sweepAngle < 0) {
            const temp = sAngle;
            sAngle = eAngle;
            eAngle = temp;
          }

          let inArc = false;
          if (sAngle <= eAngle) {
            inArc = angle >= sAngle && angle <= eAngle;
          } else {
            inArc = angle >= sAngle || angle <= eAngle;
          }
          if (inArc) d = Math.abs(distToCenter - g.r);
        }
      }

      if (d < threshold && d < minD) {
        minD = d;
        closestId = g.id;
      }
    }

    if (closestId) {
      dispatch({ type: 'SELECT_GEOMETRY', payload: closestId });
      setPopupPos({ x: e.clientX, y: e.clientY });
    } else {
      dispatch({ type: 'SELECT_GEOMETRY', payload: null });
      setPopupPos(null);
    }
  }, [active, geometries, scale, dispatch, gRef, setPopupPos]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {}, []);
  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {}, []);

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp },
    preview: null,
    statusText: '스타일을 변경할 대상을 선택하세요.',
  };
};
