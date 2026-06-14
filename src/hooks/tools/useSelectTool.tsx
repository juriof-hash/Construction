import React, { useState, useCallback } from 'react';
import { ToolHookResult } from '../../types/tool';

export const useSelectTool = (
  active: boolean,
  gRef: React.RefObject<SVGGElement | null>,
  dispatch: any
): ToolHookResult => {

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!active) return;
    // Selection logic would require checking bounding boxes or geometric distance
    // In a full implementation, we would iterate geometries and check distance < threshold
  }, [active]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
  }, [active]);

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
  }, [active]);

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp },
    preview: null,
    statusText: '객체를 선택하세요.'
  };
};
