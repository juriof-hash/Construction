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
      const { pt } = getWorldCoords(e, gRef);

      if (!startPt) {
        const { pt: snapPt, snapped } = getSnap(pt);
        setStartPt(snapPt);
        setCurrPt({ pt: snapPt, snapped });
      } else {
        const { pt: snapPt, snapped } = calcRaySnap(pt, startPt);
        // Complete line
        dispatch({
          type: "ADD_GEOMETRY",
          payload: { id: generateId(), type: "line", p1: startPt, p2: snapPt },
        });
        setStartPt(null);
        setCurrPt(null);
      }
    },
    [active, gRef, getSnap, calcRaySnap, dispatch, startPt],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!active) return;
      const { pt } = getWorldCoords(e, gRef);

      if (!startPt) {
        const { pt: snapPt, snapped } = getSnap(pt);
        setCurrPt({ pt: snapPt, snapped });
      } else {
        const { pt: snapPt, snapped, raySnapPt } = calcRaySnap(pt, startPt);
        setCurrPt({ pt: snapPt, snapped, raySnapPt });
      }
    },
    [active, gRef, startPt, getSnap, calcRaySnap],
  );

  const onPointerUp = useCallback(() => {}, []);
  const onPointerLeave = useCallback(() => {
    setCurrPt(null);
  }, []);

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
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerLeave },
    preview,
    statusText: !startPt
      ? "선의 시작점을 선택하세요."
      : "선의 끝점을 선택하세요.",
  };
};
