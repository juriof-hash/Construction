import React, { useRef, useState, useEffect } from "react";
import { useGeometry } from "../contexts/GeometryContext";
import { useInputMode } from "../hooks/useInputMode";
import { useToolManager } from "../hooks/useToolManager";
import { useGlobalSpacebar } from "../hooks/useGlobalSpacebar";
import { ObjectLayer } from "./ObjectLayer";
import { Toolbar } from "./Toolbar";
import { ChallengeModeUI } from "./ChallengeModeUI";
import { LeaderboardView } from "./LeaderboardView";
import { ToolType } from "../types/tool";
import { StylePopup } from "./StylePopup";

export const GeometryApp = () => {
  const { state, dispatch } = useGeometry();
  const { geometries, view } = state;

  const [activeTool, setActiveTool] = useState<ToolType>("compass");
  const { activeMode, setMode, mode } = useInputMode();

  const [appMode, setAppMode] = useState<"free" | "challenge" | "leaderboard">("challenge");

  const gRef = useRef<SVGGElement>(null);
  const isSpacePressed = useGlobalSpacebar();

  const [isTwoFingerPan, setIsTwoFingerPan] = useState(false);
  const [touchPanState, setTouchPanState] = useState<{
    startCenter: { x: number; y: number };
    startDistance: number;
    startView: { x: number; y: number; scale: number };
  } | null>(null);

  const [popupPos, setPopupPos] = useState<{x: number, y: number} | null>(null);

  // Clear selection when tool changes
  useEffect(() => {
    if (activeTool !== 'select') {
      dispatch({ type: 'SELECT_GEOMETRY', payload: null });
      setPopupPos(null);
    }
  }, [activeTool, dispatch]);

  const { handlers, preview, statusText, touchOffsetIndicator } =
    useToolManager(
      activeTool,
      isSpacePressed,
      isTwoFingerPan,
      gRef,
      geometries,
      view,
      dispatch,
      activeMode,
      setPopupPos
    );

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (activeMode === "touch" && e.touches.length === 2) {
      setIsTwoFingerPan(true);
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      setTouchPanState({
        startCenter: { x: cx, y: cy },
        startDistance: dist,
        startView: { x: view.x, y: view.y, scale: view.scale },
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (activeMode === "touch" && e.touches.length === 2 && touchPanState) {
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );

      let newScale = touchPanState.startView.scale;
      if (touchPanState.startDistance > 0) {
        const scaleFactor = dist / touchPanState.startDistance;
        newScale = Math.max(
          0.1,
          Math.min(10, touchPanState.startView.scale * scaleFactor),
        );
      }

      const startSvgX =
        touchPanState.startView.x +
        touchPanState.startCenter.x / touchPanState.startView.scale;
      const startSvgY =
        touchPanState.startView.y +
        touchPanState.startCenter.y / touchPanState.startView.scale;

      const newX = startSvgX - cx / newScale;
      const newY = startSvgY - cy / newScale;

      dispatch({
        type: "SET_VIEW",
        payload: {
          x: newX,
          y: newY,
          scale: newScale,
        },
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length < 2) {
      setIsTwoFingerPan(false);
      setTouchPanState(null);
    }
  };

  // Wrap handlers to intercept pointer events when panning
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

  const [winSize, setWinSize] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1000,
    h: typeof window !== "undefined" ? window.innerHeight : 1000,
  });
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    if (appMode === "free") {
      dispatch({ type: "SET_GEOMETRIES", payload: [] });
    }
  }, [appMode, dispatch]);

  useEffect(() => {
    const handleResize = () =>
      setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Wheel zoom handling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.002;
    const newScale = Math.max(
      0.1,
      Math.min(10, view.scale * Math.exp(zoomFactor)),
    );

    // Zoom toward pointer
    // e.clientX / e.clientY are the mouse coordinates relative to the viewport.
    // Ensure the SVG point under the mouse remains the same before and after zoom.
    const ptX = e.clientX;
    const ptY = e.clientY;

    const svgX = view.x + ptX / view.scale;
    const svgY = view.y + ptY / view.scale;

    const newX = svgX - ptX / newScale;
    const newY = svgY - ptY / newScale;

    dispatch({
      type: "SET_VIEW",
      payload: { x: newX, y: newY, scale: newScale },
    });
  };

  useEffect(() => {
    // Prevent pull-to-refresh on mobile
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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

      {appMode === "challenge" && <ChallengeModeUI />}
      {appMode === "leaderboard" && (
        <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[90%] max-w-md z-30 bg-white shadow-xl rounded-2xl p-4 max-h-[80vh] overflow-y-auto">
          <LeaderboardView />
        </div>
      )}

      {/* Status Text Indicator */}
      {statusText && !isSpacePressed && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-slate-800/90 text-white/90 px-4 py-2 rounded-full text-sm font-medium tracking-wide shadow backdrop-blur transition-opacity whitespace-nowrap">
            {statusText}
          </div>
        </div>
      )}

      {/* Target Crosshair for Touch */}
      {touchOffsetIndicator}

      {/* Main Canvas SVG */}
      <svg
        className={`w-full h-full absolute inset-0 z-0 select-none ${cursorClass}`}
        style={{ touchAction: "none" }}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        viewBox={`${vX} ${vY} ${vW} ${vH}`}
        preserveAspectRatio="xMidYMid slice"
        {...wrappedHandlers}
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

        {/*
          To cover the infinite panning space, the background rect should be much larger.
          Or simply rely on standard viewBox bounds `x={vX} y={vY} width={vW} height={vH}`
          to always visually cover the viewport!
        */}
        <rect x={vX} y={vY} width={vW} height={vH} fill="#fafaf9" />
        {showGrid && (
          <>
            <rect x={vX} y={vY} width={vW} height={vH} fill="url(#gridSmall)" />
            <rect x={vX} y={vY} width={vW} height={vH} fill="url(#gridLarge)" />
          </>
        )}

        {/* Global Transform Layer has no explicit transforms because viewBox handles it */}
        <g ref={gRef}>
          <ObjectLayer geometries={geometries} selectedId={state.selectedId} />
          {preview}
        </g>
      </svg>
      
      {/* Style Popup */}
      {popupPos && state.selectedId && (() => {
        const selectedGeom = geometries.find(g => g.id === state.selectedId);
        if (!selectedGeom) return null;
        
        return (
          <StylePopup 
            x={popupPos.x} 
            y={popupPos.y} 
            style={selectedGeom.style || {}} 
            label={selectedGeom.type === 'point' ? selectedGeom.label : undefined}
            disableLabelEdit={selectedGeom.source === 'initial'}
            onLabelCommit={(label) => dispatch({ type: 'UPDATE_GEOMETRY_LABEL', payload: { id: state.selectedId!, label } })}
            onChange={(style) => dispatch({ type: 'UPDATE_GEOMETRY_STYLE', payload: { id: state.selectedId!, style } })}
            onCommit={(style) => dispatch({ type: 'UPDATE_GEOMETRY_STYLE', payload: { id: state.selectedId!, style } })}
            onDelete={selectedGeom.source === 'user' ? () => {
              dispatch({ type: 'REMOVE_GEOMETRY', payload: state.selectedId! });
              setPopupPos(null);
            } : undefined}
            onClose={() => {
              dispatch({ type: 'SELECT_GEOMETRY', payload: null });
              setPopupPos(null);
            }}
          />
        );
      })()}
    </div>
  );
};
