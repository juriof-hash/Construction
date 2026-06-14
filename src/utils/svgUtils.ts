import React from 'react';
import { Point2D } from '../types/geometry';

export const getWorldCoords = (
  e: React.PointerEvent<SVGSVGElement>, 
  gRef: React.RefObject<SVGGElement | null>
): { pt: Point2D; scale: number } => {
  const fallback = { pt: { x: e.clientX, y: e.clientY }, scale: 1 };
  
  if (!gRef.current) return fallback;
  const svg = gRef.current.ownerSVGElement;
  if (!svg) return fallback;
  
  const ctm = gRef.current.getScreenCTM();
  if (!ctm) return fallback;
  
  // Inverse CTM is REQUIRED for accurate world coordinates
  const inv = ctm.inverse();
  const rawPt = svg.createSVGPoint();
  rawPt.x = e.clientX;
  rawPt.y = e.clientY;
  
  const transformed = rawPt.matrixTransform(inv);
  
  return { 
    pt: { x: transformed.x, y: transformed.y }, 
    scale: ctm.a // Uniform scale factor
  };
};

export const generateId = () => Math.random().toString(36).substring(2, 11);
