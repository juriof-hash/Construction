import React, { useState, useEffect, useCallback } from 'react';
import { Point2D } from '../../types/geometry';
import { ToolHookResult } from '../../types/tool';
import { getWorldCoords, generateId } from '../../utils/svgUtils';

export const useLineTool = (
  active: boolean,
  gRef: React.RefObject<SVGGElement | null>,
  dispatch: any,
  getSnap: (pt: Point2D) => { pt: Point2D, snapped: boolean }
): ToolHookResult => {
  const [startPt, setStartPt] = useState<Point2D | null>(null);
  const [currPt, setCurrPt] = useState<{pt: Point2D, snapped: boolean} | null>(null);

  useEffect(() => {
    if (!active) {
      setStartPt(null);
      setCurrPt(null);
    }
  }, [active]);

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!active) return;
    const { pt } = getWorldCoords(e, gRef);
    const { pt: snapPt, snapped } = getSnap(pt);
    
    if (!startPt) {
      setStartPt(snapPt);
      setCurrPt({ pt: snapPt, snapped });
    } else {
      // Complete line
      dispatch({
        type: 'ADD_GEOMETRY',
        payload: { id: generateId(), type: 'line', p1: startPt, p2: snapPt }
      });
      setStartPt(null); // Continue or reset? Let's reset for fresh line.
      setCurrPt(null);
    }
  }, [active, gRef, getSnap, dispatch, startPt]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!active) return;
    const { pt } = getWorldCoords(e, gRef);
    const { pt: snapPt, snapped } = getSnap(pt);
    setCurrPt({ pt: snapPt, snapped });
  }, [active, gRef, getSnap]);

  const onPointerUp = useCallback(() => {}, []);
  const onPointerLeave = useCallback(() => { setCurrPt(null); }, []);

  const preview = (
    <g className="pointer-events-none">
      {startPt && currPt && (
        <line x1={startPt.x} y1={startPt.y} x2={currPt.pt.x} y2={currPt.pt.y} stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" />
      )}
      {currPt && (
        <>
          {currPt.snapped && <circle cx={currPt.pt.x} cy={currPt.pt.y} r={8} fill="none" stroke="#eab308" strokeWidth={1.5} />}
          <circle cx={currPt.pt.x} cy={currPt.pt.y} r={currPt.snapped ? 4 : 3} fill={currPt.snapped ? "#eab308" : "#3b82f6"} />
        </>
      )}
    </g>
  );

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerLeave },
    preview,
    statusText: !startPt ? '선의 시작점을 선택하세요.' : '선의 끝점을 선택하세요.'
  };
};
