import React from 'react';
import { ToolType, ToolHookResult } from '../types/tool';
import { Point2D } from '../types/geometry';
import { useSelectTool } from './tools/useSelectTool';
import { usePointTool } from './tools/usePointTool';
import { useLineTool } from './tools/useLineTool';
import { useCompassTool } from './tools/useCompassTool';
import { usePanTool } from './tools/usePanTool';
import { findSnapPoint } from '../utils/snapEngine';

export const useToolManager = (
  activeTool: ToolType,
  isSpacePressed: boolean,
  gRef: React.RefObject<SVGGElement | null>,
  geometries: any[],
  view: any,
  dispatch: any,
  activeMode: 'mouse' | 'touch'
): ToolHookResult => {
  
  // Shared snap engine wrapper injects current geoms and scale
  const getSnap = (pt: Point2D) => {
    return findSnapPoint(pt, geometries, view.scale, activeMode);
  };

  // Rule: useToolManager calls all hooks unconditionally without conditional flow (no `if` statements skipping hooks).
  const select = useSelectTool(activeTool === 'select', gRef, dispatch);
  const point = usePointTool(activeTool === 'point', gRef, dispatch, getSnap);
  const line = useLineTool(activeTool === 'line', gRef, dispatch, getSnap);
  const compass = useCompassTool(activeTool === 'compass', gRef, dispatch, getSnap, activeMode, view.scale);
  const pan = usePanTool(activeTool === 'pan' || isSpacePressed, gRef, dispatch, view, isSpacePressed);

  const tools: Record<ToolType, ToolHookResult> = {
    select, point, line, compass, pan
  };

  // 스페이스바가 눌려있으면 상태를 잃지 않고 pan의 handler를 반환(오버라이드)
  return isSpacePressed ? pan : tools[activeTool];
};
