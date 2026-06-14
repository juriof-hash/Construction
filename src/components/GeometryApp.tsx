import React, { useRef, useState, useEffect } from 'react';
import { useGeometry } from '../contexts/GeometryContext';
import { useInputMode } from '../hooks/useInputMode';
import { useToolManager } from '../hooks/useToolManager';
import { useGlobalSpacebar } from '../hooks/useGlobalSpacebar';
import { ObjectLayer } from './ObjectLayer';
import { Toolbar } from './Toolbar';
import { ToolType } from '../types/tool';

export const GeometryApp = () => {
  const { state, dispatch } = useGeometry();
  const { geometries, view } = state;
  
  const [activeTool, setActiveTool] = useState<ToolType>('compass');
  const { activeMode, setMode, mode } = useInputMode();
  
  const gRef = useRef<SVGGElement>(null);
  const isSpacePressed = useGlobalSpacebar();
  
  const { handlers, preview, statusText, touchOffsetIndicator } = useToolManager(
    activeTool, isSpacePressed, gRef, geometries, view, dispatch, activeMode
  );

  const [winSize, setWinSize] = useState({ 
    w: typeof window !== 'undefined' ? window.innerWidth : 1000, 
    h: typeof window !== 'undefined' ? window.innerHeight : 1000 
  });
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    const handleResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Wheel zoom handling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.002;
    const newScale = Math.max(0.1, Math.min(10, view.scale * Math.exp(zoomFactor)));
    
    // Zoom toward pointer logic requires more complex math (calculating the focus point).
    // Simplifying to center zoom for basic stability or scaling purely.
    dispatch({ type: 'SET_VIEW', payload: { scale: newScale } });
  };

  useEffect(() => {
    // Prevent pull-to-refresh on mobile
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const cursorClass = isSpacePressed ? 'cursor-grabbing' : (activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair');
  
  // Calculate viewbox dynamically
  const vW = winSize.w / view.scale;
  const vH = winSize.h / view.scale;
  const vX = view.x;
  const vY = view.y;

  return (
    <div className="w-full h-screen overflow-hidden relative bg-slate-50 font-sans selection:bg-slate-200">
      <Toolbar 
        activeTool={activeTool} 
        setTool={setActiveTool} 
        inputMode={mode} 
        setInputMode={setMode} 
        showGrid={showGrid}
        setShowGrid={setShowGrid}
      />
      
      {/* Status Text Indicator */}
      {statusText && !isSpacePressed && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-slate-800/90 text-white/90 px-4 py-2 rounded-full text-sm font-medium tracking-wide shadow backdrop-blur transition-opacity">
            {statusText}
          </div>
        </div>
      )}

      {/* Target Crosshair for Touch */}
      {touchOffsetIndicator}

      {/* Main Canvas SVG */}
      <svg
        className={`w-full h-full absolute inset-0 z-0 select-none ${cursorClass}`}
        style={{ touchAction: 'none' }}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        viewBox={`${vX} ${vY} ${vW} ${vH}`}
        preserveAspectRatio="xMidYMid slice"
        {...handlers}
      >
        <defs>
          <pattern id="gridLarge" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(150, 160, 200, 0.2)" strokeWidth="1"/>
          </pattern>
          <pattern id="gridSmall" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(150, 160, 200, 0.1)" strokeWidth="0.5"/>
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
          <ObjectLayer geometries={geometries} />
          {preview}
        </g>
      </svg>
    </div>
  );
};
