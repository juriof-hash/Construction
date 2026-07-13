import React, { useState, useEffect, useCallback, useRef } from "react";
import { Point2D } from "../../types/geometry";
import { ToolHookResult } from "../../types/tool";
import { getWorldCoords, generateId } from "../../utils/svgUtils";
import {
  distance,
  angleBetween,
  describeArc,
  polarToCartesian,
} from "../../utils/mathUtils";
import { EuclideanPoint } from "../../components/EuclideanPoint";
import { CompassVisual } from "../../components/CompassVisual";

type CompassStep = "NEEDLE" | "PENCIL" | "SWEEP";

export const useCompassTool = (
  active: boolean,
  gRef: React.RefObject<SVGGElement | null>,
  dispatch: any,
  getSnap: (pt: Point2D) => { pt: Point2D; snapped: boolean },
  activeMode: "mouse" | "touch",
  scale: number,
): ToolHookResult => {
  const [step, setStep] = useState<CompassStep>("NEEDLE");

  // Permanent setup states
  const [center, setCenter] = useState<Point2D | null>(null);
  const [radiusPt, setRadiusPt] = useState<Point2D | null>(null);
  const [r, setR] = useState(0);

  // Ephemeral tracking
  const [hoverPt, setHoverPt] = useState<{
    pt: Point2D;
    snapped: boolean;
  } | null>(null);

  // 휘발성 상태 4개는 오직 useRef로만 관리
  const isStartedRef = useRef(false);
  const startAngleRef = useRef(0);
  const prevAngleRef = useRef(0);
  const totalSweepRef = useRef(0);
  const isMovingCenterRef = useRef(false);

  // rAF rendering state
  const [renderSweep, setRenderSweep] = useState({
    startAngle: 0,
    totalSweep: 0,
  });
  const [pencilHoverAngle, setPencilHoverAngle] = useState<number | null>(null);
  const rafRef = useRef<number>(0);
  const pencilRafRef = useRef<number>(0);

  // Status indicator
  const [lastTouchCoords, setLastTouchCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!active) {
      setStep("NEEDLE");
      setCenter(null);
      setRadiusPt(null);
      setR(0);
      setHoverPt(null);
      isStartedRef.current = false;
      setRenderSweep({ startAngle: 0, totalSweep: 0 });
      setPencilHoverAngle(null);
      setLastTouchCoords(null);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (pencilRafRef.current) cancelAnimationFrame(pencilRafRef.current);
    }
  }, [active]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!active) return;
      const { pt } = getWorldCoords(e, gRef);
      const { pt: snapPt } = getSnap(pt);

      if (step === "NEEDLE") {
        setCenter(snapPt);
        setStep("PENCIL");
      } else if (step === "PENCIL") {
        const isRightClick = e.button === 2;
        if (isRightClick) {
          setCenter(snapPt);
          isMovingCenterRef.current = true;
          return;
        }

        const radiusDist = distance(center!, snapPt);
        if (radiusDist === 0) return; // Ignore zero radius

        setRadiusPt(snapPt);
        setR(radiusDist);
        setStep("SWEEP");
      } else if (step === "SWEEP") {
        const isRightClick = e.button === 2;
        const clickTolerance = activeMode === "touch" ? 40 / scale : 20 / scale;
        const distToCenter = distance(center!, snapPt);

        if (isRightClick || distToCenter < clickTolerance) {
          isMovingCenterRef.current = true;
          setCenter(snapPt);
          return;
        }

        isStartedRef.current = true;
        const currentAngle = angleBetween(center!.x, center!.y, pt.x, pt.y);
        startAngleRef.current = currentAngle;
        prevAngleRef.current = currentAngle;
        totalSweepRef.current = 0;
        setRenderSweep({ startAngle: startAngleRef.current, totalSweep: 0 });
      }
    },
    [active, step, center, gRef, getSnap, activeMode, scale],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!active) return;
      const { pt } = getWorldCoords(e, gRef);
      const { pt: snapPt, snapped } = getSnap(pt);

      setHoverPt({ pt: snapPt, snapped });
      if (activeMode === "touch") {
        setLastTouchCoords({ x: e.clientX, y: e.clientY });
      }

      if (isMovingCenterRef.current) {
        setCenter(snapPt);
        return;
      }

      if (step === "PENCIL") {
        setRadiusPt(snapPt); // dynamic preview
      } else if (step === "SWEEP") {
        const currentAngle = angleBetween(center!.x, center!.y, pt.x, pt.y);

        if (!isStartedRef.current) {
          prevAngleRef.current = currentAngle; // 첫 프레임 튐 방지
          if (pencilRafRef.current) cancelAnimationFrame(pencilRafRef.current);
          pencilRafRef.current = requestAnimationFrame(() => {
            setPencilHoverAngle(currentAngle);
          });
          return;
        }

        let delta = currentAngle - prevAngleRef.current;
        // 각도 경계(359 -> 1) 보정
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;

        totalSweepRef.current += delta;
        prevAngleRef.current = currentAngle;

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setRenderSweep({
            startAngle: startAngleRef.current,
            totalSweep: totalSweepRef.current,
          });
        });
      }
    },
    [active, step, center, gRef, getSnap, activeMode],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!active) return;
      setLastTouchCoords(null);

      if (isMovingCenterRef.current) {
        isMovingCenterRef.current = false;
        return;
      }

      if (step === "SWEEP" && isStartedRef.current) {
        isStartedRef.current = false;
        const ts = totalSweepRef.current;
        if (Math.abs(ts) > 0.05) {
          // 헛스윙(CANCEL) 방어
          dispatch({
            type: "ADD_GEOMETRY",
            payload: {
              id: generateId(),
              type: Math.abs(ts) >= Math.PI * 2 - 0.0001 ? "circle" : "arc",
              center: center!,
              radiusPt: radiusPt!, // Include explicit coordinate reference per strictly rule
              r: r,
              startAngle: startAngleRef.current,
              sweepAngle: ts,
              style: { strokeWidth: 1, color: "#3b82f6" }, // Default: blue and thin line
            },
          });
        }
        // Reset drawing sweep, but keep the radius and center so users can draw multiple arcs
        setRenderSweep({ startAngle: 0, totalSweep: 0 });
      }
    },
    [active, step, center, radiusPt, r, dispatch],
  );

  const preview = (
    <g className="pointer-events-none">
      {center && (
        <EuclideanPoint
          x={center.x}
          y={center.y}
          color="#f59e0b"
          preview={true}
        />
      )}

      {step === "PENCIL" && radiusPt && (
        <>
          <CompassVisual needlePt={center!} pencilPt={radiusPt} />
          <circle
            cx={center!.x}
            cy={center!.y}
            r={distance(center!, radiusPt)}
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="4 4"
            fill="none"
          />
        </>
      )}

      {step === "SWEEP" && center && (
        <>
          {/* Full subtle guide path */}
          <circle
            cx={center.x}
            cy={center.y}
            r={r}
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="4 4"
            fill="none"
          />

          {/* Active drawing sweep */}
          {Math.abs(renderSweep.totalSweep) > 0 && (
            <path
              d={describeArc(
                center.x,
                center.y,
                r,
                renderSweep.startAngle,
                renderSweep.totalSweep,
              )}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
            />
          )}

          {/* Compass Visual Representation for Sweeping */}
          {(() => {
            let pt: Point2D | null = null;
            if (Math.abs(renderSweep.totalSweep) > 0 || isStartedRef.current) {
              pt = polarToCartesian(
                center.x,
                center.y,
                r,
                renderSweep.startAngle + renderSweep.totalSweep,
              );
            } else if (pencilHoverAngle !== null) {
              pt = polarToCartesian(center.x, center.y, r, pencilHoverAngle);
            }
            return pt ? (
              <CompassVisual needlePt={center} pencilPt={pt} />
            ) : null;
          })()}
        </>
      )}

      {/* Snap hover dot when not sweeping */}
      {hoverPt && !isStartedRef.current && step !== "SWEEP" && (
        <g opacity={hoverPt.snapped ? 1 : 0.5}>
          <EuclideanPoint
            x={hoverPt.pt.x}
            y={hoverPt.pt.y}
            color={hoverPt.snapped ? undefined : "#3b82f6"}
            snapped={hoverPt.snapped}
            preview={true}
          />
        </g>
      )}
    </g>
  );

  const getStatusText = () => {
    if (step === "NEEDLE") return "컴퍼스의 중심점을 선택하세요.";
    if (step === "PENCIL") return "반지름의 끝점을 선택하세요.";
    if (step === "SWEEP") return "클릭 후 드래그하여 원호를 그리세요.";
    return "";
  };

  const touchOffsetIndicator =
    activeMode === "touch" && lastTouchCoords ? (
      <div
        className="fixed pointer-events-none z-50 text-xs font-mono bg-slate-800 text-white px-2 py-1 rounded-md shadow uppercase tracking-wide opacity-80"
        style={{ left: lastTouchCoords.x - 20, top: lastTouchCoords.y - 70 }}
      >
        ✛ TARGET
      </div>
    ) : null;

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp },
    preview,
    statusText: getStatusText(),
    touchOffsetIndicator,
  };
};
