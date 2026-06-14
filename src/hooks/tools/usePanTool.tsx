import React, { useState, useEffect, useCallback } from 'react';
import { ToolHookResult } from '../../types/tool';

export const usePanTool = (
  active: boolean,
  gRef: React.RefObject<SVGGElement | null>,
  dispatch: any,
  view: { x: number, y: number, scale: number },
  isSpacePressed: boolean = false
): ToolHookResult => {
  const [isPanning, setIsPanning] = useState(false);
  const [startPt, setStartPt] = useState<{x: number, y: number} | null>(null);
  const [startView, setStartView] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    if (!active) {
      setIsPanning(false);
      setStartPt(null);
      setStartView(null);
    }
  }, [active]);

  useEffect(() => {
    if (!isSpacePressed) {
      setIsPanning(false);
      setStartPt(null);
      setStartView(null);
    }
  }, [isSpacePressed]);

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!active) return;
    e.target.setPointerCapture(e.pointerId);
    setIsPanning(true);
    setStartPt({ x: e.clientX, y: e.clientY });
    setStartView({ x: view.x, y: view.y });
  }, [active, view]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!active) return;
    
    // Auto-pan on mouse move if space is pressed
    if (isSpacePressed) {
      if (!isPanning || !startPt || !startView) {
        setIsPanning(true);
        setStartPt({ x: e.clientX, y: e.clientY });
        setStartView({ x: view.x, y: view.y });
        return;
      }
    } else {
      if (!isPanning || !startPt || !startView) return;
    }
    
    const dx = e.clientX - startPt.x;
    const dy = e.clientY - startPt.y;
    
    const ctm = gRef.current?.getScreenCTM();
    const inverseScale = ctm ? ctm.inverse().a : (1 / view.scale);
    
    dispatch({
      type: 'SET_VIEW',
      payload: { x: startView.x - dx * inverseScale, y: startView.y - dy * inverseScale }
    });
  }, [active, isPanning, startPt, startView, dispatch, gRef, view.scale, isSpacePressed, view.x, view.y]);

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!active) return;
    e.target.releasePointerCapture(e.pointerId);
    if (!isSpacePressed) {
      setIsPanning(false);
      setStartPt(null);
      setStartView(null);
    }
  }, [active, isSpacePressed]);

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp },
    preview: null,
    statusText: isSpacePressed ? '마우스를 움직여 화면을 이동하세요.' : '화면을 드래그하여 이동하세요.'
  };
};
