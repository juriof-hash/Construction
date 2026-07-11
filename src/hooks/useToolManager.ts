import React from "react";
import { ToolType, ToolHookResult } from "../types/tool";
import { Point2D } from "../types/geometry";
import { useSelectTool } from "./tools/useSelectTool";
import { usePointTool } from "./tools/usePointTool";
import { useLineTool } from "./tools/useLineTool";
import { useCompassTool } from "./tools/useCompassTool";
import { usePanTool } from "./tools/usePanTool";
import { findSnapPoint } from "../utils/snapEngine";

export const useToolManager = (
  activeTool: ToolType,
  isSpacePressed: boolean,
  isTwoFingerPan: boolean,
  gRef: React.RefObject<SVGGElement | null>,
  geometries: any[],
  view: any,
  dispatch: any,
  activeMode: "mouse" | "touch",
  setPopupPos: (pos: { x: number; y: number } | null) => void
): ToolHookResult => {
  // Shared snap engine wrapper injects current geoms and scale
  const getSnap = (pt: Point2D) => {
    return findSnapPoint(pt, geometries, view.scale, activeMode);
  };

  const disabledTools = isSpacePressed || isTwoFingerPan;
  const passedActiveTool = disabledTools ? "pan" : activeTool;

  // Rule: useToolManager calls all hooks unconditionally without conditional flow (no `if` statements skipping hooks).
  const select = useSelectTool(passedActiveTool === "select", gRef, dispatch, geometries, view.scale, setPopupPos);
  const point = usePointTool(
    passedActiveTool === "point",
    gRef,
    dispatch,
    getSnap,
  );
  const line = useLineTool(
    passedActiveTool === "line",
    gRef,
    dispatch,
    getSnap,
    geometries,
    view.scale,
  );
  const compass = useCompassTool(
    passedActiveTool === "compass",
    gRef,
    dispatch,
    getSnap,
    activeMode,
    view.scale,
  );
  const pan = usePanTool(
    passedActiveTool === "pan",
    gRef,
    dispatch,
    view,
    disabledTools,
  );

  const tools: Record<ToolType, ToolHookResult> = {
    select,
    point,
    line,
    compass,
    pan,
  };

  return tools[passedActiveTool];
};
