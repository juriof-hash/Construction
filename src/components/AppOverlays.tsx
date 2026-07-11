import React from "react";
import { AppMode, Geometry } from "../types/tool";
import { ChallengeModeUI } from "./ChallengeModeUI";
import { LeaderboardView } from "./LeaderboardView";
import { StylePopup } from "./StylePopup";

interface AppOverlaysProps {
  appMode: AppMode;
  statusText: string | null;
  isSpacePressed: boolean;
  popupPos: { x: number; y: number } | null;
  selectedId: string | null;
  geometries: Geometry[];
  dispatch: any;
  setPopupPos: (pos: { x: number; y: number } | null) => void;
}

export const AppOverlays: React.FC<AppOverlaysProps> = ({
  appMode,
  statusText,
  isSpacePressed,
  popupPos,
  selectedId,
  geometries,
  dispatch,
  setPopupPos,
}) => {
  return (
    <>
      {appMode === "challenge" && <ChallengeModeUI />}
      {appMode === "leaderboard" && (
        <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[90%] max-w-md z-30 bg-white shadow-xl rounded-2xl p-4 max-h-[80vh] overflow-y-auto">
          <LeaderboardView />
        </div>
      )}

      {/* Status Text Indicator */}
      {statusText && !isSpacePressed && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-slate-800/90 text-white/90 px-4 py-2 rounded-full text-sm font-medium tracking-wide shadow backdrop-blur transition-opacity whitespace-nowrap">
            {statusText}
          </div>
        </div>
      )}

      {/* Style Popup */}
      {popupPos && selectedId && (() => {
        const selectedGeom = geometries.find((g) => g.id === selectedId);
        if (!selectedGeom) return null;

        return (
          <StylePopup
            x={popupPos.x}
            y={popupPos.y}
            style={selectedGeom.style || {}}
            label={selectedGeom.type === "point" ? selectedGeom.label : undefined}
            disableLabelEdit={selectedGeom.source === "initial"}
            onLabelCommit={(label) =>
              dispatch({
                type: "UPDATE_GEOMETRY_LABEL",
                payload: { id: selectedId, label },
              })
            }
            onChange={(style) =>
              dispatch({
                type: "UPDATE_GEOMETRY_STYLE",
                payload: { id: selectedId, style },
              })
            }
            onCommit={(style) =>
              dispatch({
                type: "UPDATE_GEOMETRY_STYLE",
                payload: { id: selectedId, style },
              })
            }
            onDelete={
              selectedGeom.source === "user"
                ? () => {
                    dispatch({ type: "REMOVE_GEOMETRY", payload: selectedId });
                    setPopupPos(null);
                  }
                : undefined
            }
            onClose={() => {
              dispatch({ type: "SELECT_GEOMETRY", payload: null });
              setPopupPos(null);
            }}
          />
        );
      })()}
    </>
  );
};
