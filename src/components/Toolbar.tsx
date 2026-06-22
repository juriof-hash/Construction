import React from "react";
import { ToolType } from "../types/tool";
import {
  MousePointer2,
  Move,
  Circle,
  Slash,
  DraftingCompass,
  Undo2,
  Redo2,
  Hand,
  Mouse,
  Smartphone,
  Grid3x3,
  Maximize,
} from "lucide-react";
import { useGeometry } from "../contexts/GeometryContext";

interface ToolbarProps {
  activeTool: ToolType;
  setTool: (t: ToolType) => void;
  inputMode: string;
  setInputMode: (m: "auto" | "mouse" | "touch") => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
}

export const Toolbar = ({
  activeTool,
  setTool,
  inputMode,
  setInputMode,
  showGrid,
  setShowGrid,
}: ToolbarProps) => {
  const { dispatch } = useGeometry();

  const handleZoom = (dz: number) => {
    dispatch({
      type: "SET_VIEW",
      payload: { scale: Math.max(0.1, Math.min(5, dz)) },
    }); // Need full state for this actually
  };

  return (
    <>
      <div className="fixed top-6 right-6 flex flex-col gap-4 items-end z-20">
        <div className="flex gap-2 bg-white/80 backdrop-blur shadow-lg rounded-xl p-2 border border-slate-200/50">
          <button
            onClick={() => {
              dispatch({
                type: "SET_VIEW",
                payload: {
                  x: -window.innerWidth / 2,
                  y: -window.innerHeight / 2,
                  scale: 1,
                },
              });
            }}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
            title="시점 초기화"
          >
            <Maximize size={18} />
          </button>
          <div className="w-px bg-slate-200 mx-1"></div>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors ${showGrid ? "bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-700"}`}
            title="그리드 표시/숨기기"
          >
            <Grid3x3 size={18} />
          </button>
          <div className="w-px bg-slate-200 mx-1"></div>
          <button
            onClick={() => dispatch({ type: "UNDO" })}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={() => dispatch({ type: "REDO" })}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
          >
            <Redo2 size={18} />
          </button>
        </div>

        <div className="flex gap-2 bg-white/80 backdrop-blur shadow-lg rounded-xl p-2 border border-slate-200/50">
          <button
            onClick={() => setInputMode("auto")}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-xs font-semibold ${inputMode === "auto" ? "bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-700"}`}
          >
            AUTO
          </button>
          <button
            onClick={() => setInputMode("mouse")}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg ${inputMode === "mouse" ? "bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-700"}`}
          >
            <Mouse size={18} />
          </button>
          <button
            onClick={() => setInputMode("touch")}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg ${inputMode === "touch" ? "bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-700"}`}
          >
            <Smartphone size={18} />
          </button>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-3 border border-slate-200/50 z-20">
        <ToolButton
          active={activeTool === "select"}
          onClick={() => setTool("select")}
          icon={<MousePointer2 size={24} strokeWidth={1.5} />}
          label="선택"
        />
        <div className="w-px h-10 bg-slate-200 mx-1 md:mx-2"></div>
        <ToolButton
          active={activeTool === "point"}
          onClick={() => setTool("point")}
          icon={
            <div className="w-2.5 h-2.5 rounded-full bg-current m-[10.5px]" />
          }
          label="점"
        />
        <ToolButton
          active={activeTool === "line"}
          onClick={() => setTool("line")}
          icon={<Slash size={24} strokeWidth={1.5} />}
          label="선"
        />
        <ToolButton
          active={activeTool === "compass"}
          onClick={() => setTool("compass")}
          icon={<DraftingCompass size={24} strokeWidth={1.5} />}
          label="컴퍼스"
        />
        <div className="w-px h-10 bg-slate-200 mx-1 md:mx-2"></div>
        <ToolButton
          active={activeTool === "pan"}
          onClick={() => setTool("pan")}
          icon={<Hand size={24} strokeWidth={1.5} />}
          label="이동"
        />
      </div>
    </>
  );
};

const ToolButton = ({ active, onClick, icon, label }: any) => {
  return (
    <div className="group relative flex flex-col items-center">
      <button
        onClick={onClick}
        className={`min-w-[44px] min-h-[44px] p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${active ? "bg-slate-800 text-white shadow-md" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
        aria-label={label}
      >
        {icon}
      </button>
      <span className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded shadow-sm whitespace-nowrap pointer-events-none">
        {label}
      </span>
    </div>
  );
};
