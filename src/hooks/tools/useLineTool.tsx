import React, { useState, useEffect, useCallback, useRef } from "react";
import { Point2D, Geometry } from "../../types/geometry";
import { ToolHookResult } from "../../types/tool";
import { getWorldCoords, generateId } from "../../utils/svgUtils";
import { EuclideanPoint } from "../../components/EuclideanPoint";

export const useLineTool = (
  active: boolean,
  gRef: React.RefObject<SVGGElement | null>,
  dispatch: any,
  getSnap: (pt: Point2D) => { pt: Point2D; snapped: boolean },
  geometries: Geometry[],
  scale: number,
): ToolHookResult => {
  const [startPt, setStartPt] = useState<Point2D | null>(null);
  const [currPt, setCurrPt] = useState<{
    pt: Point2D;
    snapped: boolean;
    raySnapPt?: Point2D;
  } | null>(null);

  const dragState = useRef({
    isDown: false,
    hasDragged: false,
    rawDownPt: null as Point2D | null,
    isNewStart: false,
  });

  // geometriesRef to always have latest without triggering useCallback deps unnecessarily
  const geomRef = useRef(geometries);
  geomRef.current = geometries;

  useEffect(() => {
    if (!active) {
      setStartPt(null);
      setCurrPt(null);
    }
  }, [active]);

  const calcRaySnap = useCallback(
    (mousePt: Point2D, basePt: Point2D) => {
      const snapResult = getSnap(mousePt);
      if (snapResult.snapped) {
        return { pt: snapResult.pt, snapped: true };
      }

      // Try ray snapping
      const worldRadius = 15 / scale;
      const candidates: Point2D[] = [];

      geomRef.current.forEach((g) => {
        if (g.type === "point") candidates.push(g.pt);
        else if (g.type === "line") {
          candidates.push(g.p1);
          candidates.push(g.p2);
        }
        // other geometry keypoints could be added, but points and endpoints are enough
      });

      let bestSnappingPt = mousePt;
      let minScore = Infinity;
      let bestRaySnapPt: Point2D | undefined = undefined;

      for (const p of candidates) {
        const dx = p.x - basePt.x;
        const dy = p.y - basePt.y;
        const len = Math.hypot(dx, dy);
        if (len < 1e-4) continue; // same as startPt

        const dirX = dx / len;
        const dirY = dy / len;

        const mDx = mousePt.x - basePt.x;
        const mDy = mousePt.y - basePt.y;

        const dot = mDx * dirX + mDy * dirY;

        if (dot > 0) {
          // mouse is in front
          const projX = basePt.x + dirX * dot;
          const projY = basePt.y + dirY * dot;

          const distToRay = Math.hypot(mousePt.x - projX, mousePt.y - projY);

          if (distToRay < worldRadius) {
            const score = distToRay;
            if (score < minScore) {
              minScore = score;
              bestSnappingPt = { x: projX, y: projY };
              bestRaySnapPt = p;
            }
          }
        }
      }

      if (minScore < Infinity) {
        return { pt: bestSnappingPt, snapped: true, raySnapPt: bestRaySnapPt };
      }

      return { pt: mousePt, snapped: false };
    },
    [getSnap, scale],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!active) return;
      
      if (!e.isPrimary) {
         setStartPt(null);
         setCurrPt(null);
         dragState.current.isDown = false;
         return;
      }

      const { pt } = getWorldCoords(e, gRef);
      const { pt: snapPt, snapped } = getSnap(pt);

      dragState.current.isDown = true;
      dragState.current.hasDragged = false;
      dragState.current.rawDownPt = pt;

      if (!startPt) {
        setStartPt(snapPt);
        setCurrPt({ pt: snapPt, snapped });
        dragState.current.isNewStart = true;
      } else {
        dragState.current.isNewStart = false;
        const { pt: raySnapPt, snapped: raySnapped, raySnapPt: rayPt } = calcRaySnap(pt, startPt);
        setCurrPt({ pt: raySnapPt, snapped: raySnapped, raySnapPt: rayPt });
      }
    },
    [active, gRef, getSnap, calcRaySnap, startPt],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!active || !e.isPrimary) return;

      const { pt } = getWorldCoords(e, gRef);

      if (dragState.current.isDown && dragState.current.rawDownPt) {
        const dist = Math.hypot(pt.x - dragState.current.rawDownPt.x, pt.y - dragState.current.rawDownPt.y);
        if (dist > 10 / scale) {
          dragState.current.hasDragged = true;
        }
      }

      if (!startPt) {
        const { pt: snapPt, snapped } = getSnap(pt);
        setCurrPt({ pt: snapPt, snapped });
      } else {
        const { pt: snapPt, snapped, raySnapPt } = calcRaySnap(pt, startPt);
        setCurrPt({ pt: snapPt, snapped, raySnapPt });
      }
    },
    [active, gRef, startPt, getSnap, calcRaySnap, scale],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!active || !e.isPrimary) return;
      dragState.current.isDown = false;

      if (!startPt) return;

      const { pt } = getWorldCoords(e, gRef);

      if (dragState.current.hasDragged || !dragState.current.isNewStart) {
        const { pt: snapPt } = calcRaySnap(pt, startPt);
        const dx = snapPt.x - startPt.x;
        const dy = snapPt.y - startPt.y;
        if (Math.hypot(dx, dy) > 1e-4) {
          dispatch({
            type: "ADD_GEOMETRY",
            payload: { id: generateId(), type: "line", p1: startPt, p2: snapPt },
          });
        }
        setStartPt(null);
        const { pt: hoverPt, snapped } = getSnap(pt);
        setCurrPt({ pt: hoverPt, snapped });
      } else {
        dragState.current.isNewStart = false;
      }
    },
    [active, gRef, startPt, calcRaySnap, dispatch, getSnap]
  );

  const onPointerCancel = useCallback(() => {
    dragState.current.isDown = false;
    setStartPt(null);
    setCurrPt(null);
  }, []);

  const onPointerLeave = useCallback(() => {
    if (!dragState.current.isDown && !startPt) {
      setCurrPt(null);
    }
  }, [startPt]);

  const preview = (
    <g className="pointer-events-none">
      {startPt && currPt && (
        <line
          x1={startPt.x}
          y1={startPt.y}
          x2={currPt.pt.x}
          y2={currPt.pt.y}
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4 4"
        />
      )}
      {currPt && currPt.raySnapPt && (
        <line
          x1={startPt!.x}
          y1={startPt!.y}
          x2={currPt.raySnapPt.x}
          y2={currPt.raySnapPt.y}
          stroke="#eab308"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
      )}
      {currPt && (
        <EuclideanPoint
          x={currPt.pt.x}
          y={currPt.pt.y}
          color={currPt.snapped ? undefined : "#3b82f6"}
          snapped={currPt.snapped}
          preview={true}
        />
      )}
    </g>
  );

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerLeave, onPointerCancel },
    preview,
    statusText: !startPt
      ? "선의 시작점을 선택하세요."
      : "선의 끝점을 선택하세요.",
  };
};
