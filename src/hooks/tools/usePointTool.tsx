import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Point2D } from '../../types/geometry';
import { ToolHookResult } from '../../types/tool';
import { getWorldCoords, generateId } from '../../utils/svgUtils';

export const usePointTool = (
  active: boolean,
  gRef: React.RefObject<SVGGElement | null>,
  dispatch: any,
  getSnap: (pt: Point2D) => { pt: Point2D, snapped: boolean }
): ToolHookResult => {
  const [hoverPt, setHoverPt] = useState<{pt: Point2D, snapped: boolean} | null>(null);

  useEffect(() => {
    if (!active) setHoverPt(null); // 클린업 필수 (고아 상태 방지)
  }, [active]);

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!active) return;
    e.target.releasePointerCapture(e.pointerId); // Prevent native dragging capture defaults
    
    const { pt } = getWorldCoords(e, gRef);
    const { pt: snapPt } = getSnap(pt);
    
    dispatch({
      type: 'ADD_GEOMETRY',
      payload: { id: generateId(), type: 'point', pt: snapPt }
    });
  }, [active, gRef, getSnap, dispatch]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!active) return;
    const { pt } = getWorldCoords(e, gRef);
    const { pt: snapPt, snapped } = getSnap(pt);
    setHoverPt({ pt: snapPt, snapped });
  }, [active, gRef, getSnap]);

  const onPointerUp = useCallback(() => {}, []);
  const onPointerLeave = useCallback(() => { setHoverPt(null); }, []);

  const preview = hoverPt ? (
    <g className="pointer-events-none">
      {hoverPt.snapped && <circle cx={hoverPt.pt.x} cy={hoverPt.pt.y} r={8} fill="none" stroke="#eab308" strokeWidth={1.5} />}
      <circle cx={hoverPt.pt.x} cy={hoverPt.pt.y} r={hoverPt.snapped ? 4 : 3} fill={hoverPt.snapped ? "#eab308" : "#3b82f6"} />
    </g>
  ) : null;

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerLeave },
    preview,
    statusText: '점을 찍을 위치를 선택하세요.'
  };
};
