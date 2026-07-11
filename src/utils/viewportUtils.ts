export interface ViewState {
  x: number;
  y: number;
  scale: number;
}

export function zoomAroundPoint(
  view: ViewState,
  screenPt: { x: number; y: number },
  newScale: number
): ViewState {
  // Zoom toward pointer
  // screenPt.x / screenPt.y are the mouse coordinates relative to the viewport.
  // Ensure the SVG point under the mouse remains the same before and after zoom.
  const svgX = view.x + screenPt.x / view.scale;
  const svgY = view.y + screenPt.y / view.scale;

  const newX = svgX - screenPt.x / newScale;
  const newY = svgY - screenPt.y / newScale;

  return { x: newX, y: newY, scale: newScale };
}
