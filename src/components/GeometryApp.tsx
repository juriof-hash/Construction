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
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useGifRecorder } from "../hooks/useGifRecorder";
import { GifMakerUI } from "./GifMakerUI";
import { ZoomIn, ZoomOut, Expand } from "lucide-react";
import { zoomAroundPoint } from "../utils/viewportUtils";

export const GeometryApp: React.FC = () => {
  const { state, dispatch } = useGeometry();
  const { geometries, view } = state;
  const gRef = useRef<SVGGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [appMode, setAppMode] = useState<AppMode>("free");
  const [showGrid, setShowGrid] = useState(true);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);

  const { mode: currentInputMode, activeMode, setMode: setInputMode } = useInputMode();
  const setMode = (m: "auto" | "mouse" | "touch") => {
    localStorage.setItem("geometry_input_mode", m);
    window.dispatchEvent(new Event("storage"));
    setInputMode(m);
  };

  const isSpacePressed = useGlobalSpacebar();
  const winSize = useWindowSize();

  const { viewportHandlers, isTwoFingerPan } = useViewportControls(
    view,
    dispatch,
    activeMode
  );

  const { frames, isProcessing, progress, captureFrame, clearFrames, createGif } = useGifRecorder(svgRef);

  useKeyboardShortcuts(dispatch, setActiveTool, state.selectedId, geometries, captureFrame);

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
      onPointerCancel: (e: React.PointerEvent<SVGSVGElement>) => {
        handlers.onPointerCancel?.(e);
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
        inputMode={currentInputMode}
        setInputMode={setMode}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        onCapture={captureFrame}
      />

      
      {/* Zoom Controls */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-6 z-20 flex flex-col items-center gap-1 bg-white/90 backdrop-blur shadow-xl rounded-xl p-1 border border-slate-200/50">
        <button
          onClick={() => {
            const newScale = Math.min(10, view.scale * 1.5);
            const center = { x: winSize.w / 2, y: winSize.h / 2 };
            dispatch({ type: "SET_VIEW", payload: zoomAroundPoint(view, center, newScale) });
          }}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          title="확대 (Zoom In)"
        >
          <ZoomIn size={20} />
        </button>
        <div className="w-8 h-px bg-slate-200 mx-auto"></div>
        <button
          onClick={() => {
            const newScale = Math.max(0.1, view.scale / 1.5);
            const center = { x: winSize.w / 2, y: winSize.h / 2 };
            dispatch({ type: "SET_VIEW", payload: zoomAroundPoint(view, center, newScale) });
          }}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          title="축소 (Zoom Out)"
        >
          <ZoomOut size={20} />
        </button>
        <div className="w-8 h-px bg-slate-200 mx-auto"></div>
        <button
          onClick={() => {
            dispatch({ type: "SET_VIEW", payload: { x: 0, y: 0, scale: 1 } });
          }}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          title="원래 크기로 (Reset Zoom)"
        >
          <Expand size={20} />
        </button>
      </div>

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

      <GifMakerUI
        frameCount={frames.length}
        isProcessing={isProcessing}
        progress={progress}
        onCreateGif={createGif}
        onClear={clearFrames}
      />

      {/* Target Crosshair for Touch */}
      {touchOffsetIndicator}

      {/* Main Canvas SVG */}
      <svg
        ref={svgRef}
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
