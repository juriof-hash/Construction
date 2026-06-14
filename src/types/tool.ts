import { ReactNode, PointerEvent } from 'react';
import { Point2D } from './geometry';

export type ToolType = 'select' | 'point' | 'line' | 'compass' | 'pan';

export interface ToolHandlers {
  onPointerDown: (e: PointerEvent<SVGSVGElement>) => void;
  onPointerMove: (e: PointerEvent<SVGSVGElement>) => void;
  onPointerUp: (e: PointerEvent<SVGSVGElement>) => void;
  onPointerLeave?: (e: PointerEvent<SVGSVGElement>) => void;
}

export interface ToolHookResult {
  handlers: ToolHandlers;
  preview: ReactNode | null;
  statusText?: string | null;
  touchOffsetIndicator?: ReactNode | null;
}

export type InputMode = 'auto' | 'mouse' | 'touch';
