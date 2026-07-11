import React, { useState } from "react";
import { ViewState, zoomAroundPoint } from "../utils/viewportUtils";

interface TouchPanState {
  startDistance: number;
  startCenter: { x: number; y: number };
  startView: ViewState;
}

export const useViewportControls = (
  view: ViewState,
  dispatch: any,
  activeMode: "mouse" | "touch",
) => {
  const [isTwoFingerPan, setIsTwoFingerPan] = useState(false);
  const [touchPanState, setTouchPanState] = useState<TouchPanState | null>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.002;
    const newScale = Math.max(
      0.1,
      Math.min(10, view.scale * Math.exp(zoomFactor))
    );
    const newView = zoomAroundPoint(
      view,
      { x: e.clientX, y: e.clientY },
      newScale
    );
    dispatch({ type: "SET_VIEW", payload: newView });
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (activeMode === "touch" && e.touches.length === 2) {
      setIsTwoFingerPan(true);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      setTouchPanState({
        startDistance: dist,
        startCenter: { x: cx, y: cy },
        startView: { ...view },
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (
      activeMode === "touch" &&
      e.touches.length === 2 &&
      touchPanState
    ) {
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      let newScale = touchPanState.startView.scale;
      if (touchPanState.startDistance > 0) {
        const scaleFactor = dist / touchPanState.startDistance;
        newScale = Math.max(
          0.1,
          Math.min(10, touchPanState.startView.scale * scaleFactor)
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

  return {
    viewportHandlers: {
      onWheel: handleWheel,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
    },
    isTwoFingerPan,
  };
};
