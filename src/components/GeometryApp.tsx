import React, { useState, useEffect, useRef } from "react";
import { useGeometry } from "../contexts/GeometryContext";
import { AppMode, ToolType } from "../types/tool";
import { ObjectLayer } from "./ObjectLayer";
import { Toolbar } from "./Toolbar";
import { useToolManager } from "../hooks/useToolManager";
import { useInputMode } from "../hooks/useInputMode";
import { useGlobalSpacebar } from "../hooks/useGlobalSpacebar";
import { AppOverlays } from "./AppOverlays";
import { useWindowSize } from "../hooks/useWindowSize";
import { useViewportControls } from "../hooks/useViewportControls";

export const GeometryApp: React.FC = () => {
  const { state, dispatch } = useGeometry();
  const { geometries, view } = state;
  const gRef = useRef<SVGGElement>(null);

  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [appMode, setAppMode] = useState<AppMode>("free");
  const [showGrid, setShowGrid] = useState(true);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);

  const mode = useInputMode();
  const setMode = (m: "auto" | "mouse" | "touch") => {
    localStorage.setItem("geometry_input_mode", m);
    window.dispatchEvent(new Event("storage"));
  };

  const isSpacePressed = useGlobalSpacebar();
  const winSize = useWindowSize();

  const { viewportHandlers, isTwoFingerPan } = useViewportControls(
    view,
    dispatch,
    mode
  );

  const { handlers, preview, statusText, touchOffsetIndicator } =
    useToolManager(
      activeTool,
      isSpacePressed,
      isTwoFingerPan,
      gRef,
      geometries,
      view,
      dispatch,
      mode,
      setPopupPos
    );

  // Wrap tool handlers to intercept pointer events when panning
  const wrappedHandlers = React.useMemo(() => {
    return {
      onPointerDown: (e: React.PointerEvent<SVGSVGElement>) => {
        if (isTwoFingerPan) return;
        handlers.onPointerDown?.(e);
      },
      onPointerMove: (e: React.PointerEvent<SVGSVGElement>) => {
        if (isTwoFingerPan) return;
        handlers.onPointerMove?.(e);
      },
      onPointerUp: (e: React.PointerEvent<SVGSVGElement>) => {
        if (isTwoFingerPan) return;
        handlers.onPointerUp?.(e);
      },
      onPointerLeave: (e: React.PointerEvent<SVGSVGElement>) => {
        if (isTwoFingerPan) return;
        handlers.onPointerLeave?.(e);
      },
    };
  }, [handlers, isTwoFingerPan]);

  useEffect(() => {
    if (appMode === "free") {
      dispatch({ type: "SET_GEOMETRIES", payload: [] });
    }
  }, [appMode, dispatch]);

  const cursorClass = isSpacePressed
    ? "cursor-grabbing"
    : activeTool === "pan"
      ? "cursor-grab active:cursor-grabbing"
      : "cursor-crosshair";

  // Calculate viewbox dynamically
  const vW = winSize.w / view.scale;
  const vH = winSize.h / view.scale;
  const vX = view.x;
  const vY = view.y;

  return (
    <div className="w-full h-screen overflow-hidden relative bg-slate-50 font-sans selection:bg-slate-200">
      <Toolbar
        appMode={appMode}
        setAppMode={setAppMode}
        activeTool={activeTool}
        setTool={setActiveTool}
        inputMode={mode}
        setInputMode={setMode}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
      />

      <AppOverlays
        appMode={appMode}
        statusText={statusText}
        isSpacePressed={isSpacePressed}
        popupPos={popupPos}
        selectedId={state.selectedId}
        geometries={geometries}
        dispatch={dispatch}
        setPopupPos={setPopupPos}
      />

      {/* Target Crosshair for Touch */}
      {touchOffsetIndicator}

      {/* Main Canvas SVG */}
      <svg
        className={`w-full h-full absolute inset-0 z-0 select-none ${cursorClass}`}
        style={{ touchAction: "none" }}
        onContextMenu={(e) => e.preventDefault()}
        viewBox={`${vX} ${vY} ${vW} ${vH}`}
        preserveAspectRatio="xMidYMid slice"
        {...viewportHandlers} // onWheel, onTouchStart, onTouchMove, onTouchEnd, onTouchCancel
        {...wrappedHandlers}  // onPointerDown, onPointerMove, onPointerUp, onPointerLeave
      >
        <defs>
          <pattern
            id="gridLarge"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="rgba(150, 160, 200, 0.2)"
              strokeWidth="1"
            />
          </pattern>
          <pattern
            id="gridSmall"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(150, 160, 200, 0.1)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        <rect x={vX} y={vY} width={vW} height={vH} fill="#fafaf9" />

        {showGrid && (
          <>
            <rect x={vX} y={vY} width={vW} height={vH} fill="url(#gridSmall)" />
            <rect x={vX} y={vY} width={vW} height={vH} fill="url(#gridLarge)" />
          </>
        )}

        <g ref={gRef}>
          <ObjectLayer geometries={geometries} selectedId={state.selectedId} />
          {preview}
        </g>
      </svg>
    </div>
  );
};
