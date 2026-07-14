import { useEffect } from "react";
import { ToolType } from "../types/tool";
import { Geometry } from "../types/geometry";
import { COLORS } from "../constants/colors";

export const useKeyboardShortcuts = (
  dispatch: any,
  setActiveTool: (tool: ToolType) => void,
  selectedId: string | null,
  geometries: Geometry[],
  onCapture?: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Tool selection
      if (key === "a") {
        setActiveTool("select");
      } else if (key === "s") {
        setActiveTool("point");
      } else if (key === "d") {
        setActiveTool("line");
      } else if (key === "f") {
        setActiveTool("compass");
      }
      
      // Capture frame
      else if (key === "t" && onCapture) {
        onCapture();
      }

      // Undo/Redo
      else if (key === "[") {
        dispatch({ type: "UNDO" });
      } else if (key === "]") {
        dispatch({ type: "REDO" });
      }

      // Style modifications
      if (selectedId) {
        const selectedGeom = geometries.find((g) => g.id === selectedId);
        if (!selectedGeom) return;
        const currentStyle = selectedGeom.style || {};

        // Colors (1-9)
        if (key >= "1" && key <= "9") {
          const colorIndex = parseInt(key) - 1;
          if (colorIndex >= 0 && colorIndex < COLORS.length) {
            dispatch({
              type: "UPDATE_GEOMETRY_STYLE",
              payload: { id: selectedId, style: { color: COLORS[colorIndex] } },
            });
          }
        }
        
        // Thickness
        else if (key === "arrowleft" || key === "q") {
          const currentWidth = currentStyle.strokeWidth || 2;
          if (currentWidth > 1) {
            dispatch({
              type: "UPDATE_GEOMETRY_STYLE",
              payload: { id: selectedId, style: { strokeWidth: currentWidth - 1 } },
            });
          }
        } else if (key === "arrowright" || key === "w") {
          const currentWidth = currentStyle.strokeWidth || 2;
          if (currentWidth < 10) {
            dispatch({
              type: "UPDATE_GEOMETRY_STYLE",
              payload: { id: selectedId, style: { strokeWidth: currentWidth + 1 } },
            });
          }
        }
        
        // Dash style
        else if (key === "enter") {
          const newDashStyle = (!currentStyle.dashStyle || currentStyle.dashStyle === "solid") ? "dashed" : "solid";
          dispatch({
            type: "UPDATE_GEOMETRY_STYLE",
            payload: { id: selectedId, style: { dashStyle: newDashStyle } },
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, setActiveTool, selectedId, geometries]);
};
