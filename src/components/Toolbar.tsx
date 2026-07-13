import React, { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { useGeometry } from "../contexts/GeometryContext";

interface ToolbarProps {
  appMode: "free" | "challenge" | "leaderboard";
  setAppMode: (mode: "free" | "challenge" | "leaderboard") => void;
  activeTool: ToolType;
  setTool: (t: ToolType) => void;
  inputMode: string;
  setInputMode: (m: "auto" | "mouse" | "touch") => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
}

export const Toolbar = ({
  appMode,
  setAppMode,
  activeTool,
  setTool,
  inputMode,
  setInputMode,
  showGrid,
  setShowGrid,
}: ToolbarProps) => {
  const { dispatch } = useGeometry();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const SettingsPanel = ({ isMobile = false }) => (
    <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row items-center gap-2'}`}>
      <div className={`relative z-20 flex gap-2 ${isMobile ? 'bg-white/80 backdrop-blur shadow-lg rounded-xl p-2 border border-slate-200/50 justify-between' : ''}`}>
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
            if (isMobile) setIsMenuOpen(false);
          }}
          className="group relative hover:z-50 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
        >
          <Maximize size={18} />
          <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded shadow-sm whitespace-nowrap pointer-events-none z-50">
            시점 초기화
          </span>
        </button>
        <div className="w-px bg-slate-200 mx-1"></div>
        <button
          onClick={() => { setShowGrid(!showGrid); if (isMobile) setIsMenuOpen(false); }}
          className={`group relative hover:z-50 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors ${showGrid ? "bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-700"}`}
        >
          <Grid3x3 size={18} />
          <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded shadow-sm whitespace-nowrap pointer-events-none z-50">
            그리드 표시/숨기기
          </span>
        </button>
        <div className="w-px bg-slate-200 mx-1"></div>
        <button
          onClick={() => { dispatch({ type: "UNDO" }); if (isMobile) setIsMenuOpen(false); }}
          className="group relative hover:z-50 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
        >
          <Undo2 size={18} />
          <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded shadow-sm whitespace-nowrap pointer-events-none z-50">
            실행 취소 <span className="ml-1 text-slate-400">([)</span>
          </span>
        </button>
        <button
          onClick={() => { dispatch({ type: "REDO" }); if (isMobile) setIsMenuOpen(false); }}
          className="group relative hover:z-50 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
        >
          <Redo2 size={18} />
          <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded shadow-sm whitespace-nowrap pointer-events-none z-50">
            재실행 <span className="ml-1 text-slate-400">(])</span>
          </span>
        </button>
      </div>

      <div className={`${isMobile ? 'hidden' : 'w-px h-6 bg-slate-200 mx-1'}`}></div>

      <div className={`relative z-10 flex gap-2 ${isMobile ? 'bg-white/80 backdrop-blur shadow-lg rounded-xl p-2 border border-slate-200/50 justify-between' : ''}`}>
        <button
          onClick={() => { setInputMode("auto"); if (isMobile) setIsMenuOpen(false); }}
          className={`group relative hover:z-50 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-xs font-semibold ${inputMode === "auto" ? "bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-700"}`}
        >
          AUTO
          <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded shadow-sm whitespace-nowrap pointer-events-none z-50">
            자동 입력 모드
          </span>
        </button>
        <button
          onClick={() => { setInputMode("mouse"); if (isMobile) setIsMenuOpen(false); }}
          className={`group relative hover:z-50 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg ${inputMode === "mouse" ? "bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-700"}`}
        >
          <Mouse size={18} />
          <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded shadow-sm whitespace-nowrap pointer-events-none z-50">
            마우스 모드
          </span>
        </button>
        <button
          onClick={() => { setInputMode("touch"); if (isMobile) setIsMenuOpen(false); }}
          className={`group relative hover:z-50 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg ${inputMode === "touch" ? "bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-700"}`}
        >
          <Smartphone size={18} />
          <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded shadow-sm whitespace-nowrap pointer-events-none z-50">
            터치 모드
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Unified Top Bar (Desktop & Mobile) */}
      <div className="fixed top-4 inset-x-2 md:top-6 md:left-1/2 md:-translate-x-1/2 md:inset-x-auto z-30 flex items-center justify-between md:justify-center gap-1 md:gap-2 bg-white/90 backdrop-blur shadow-lg rounded-xl p-1.5 border border-slate-200 pointer-events-auto">
        
        {/* Mode Tabs */}
        <div className="flex flex-1 md:flex-none items-center gap-1 md:gap-2">
          <button
            onClick={() => setAppMode("free")}
            className={`flex-1 md:flex-none min-w-[70px] whitespace-nowrap px-1 md:px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-base font-semibold transition-colors ${appMode === "free" ? "bg-slate-800 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
          >
            자유 모드
          </button>
          <button
            onClick={() => setAppMode("challenge")}
            className={`flex-1 md:flex-none min-w-[70px] whitespace-nowrap px-1 md:px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-base font-semibold transition-colors ${appMode === "challenge" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
          >
            도전 모드
          </button>
          <button
            onClick={() => setAppMode("leaderboard")}
            className={`flex-1 md:flex-none min-w-[70px] whitespace-nowrap px-1 md:px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-base font-semibold transition-colors ${appMode === "leaderboard" ? "bg-yellow-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
          >
            명예의 전당
          </button>
        </div>

        {/* Separator */}
        <div className="md:hidden w-px h-6 bg-slate-200 mx-1"></div>

        {/* Desktop Settings Tools */}
        <div className="hidden md:flex items-center gap-1">
          <SettingsPanel isMobile={false} />
        </div>

        {/* Hamburger Button (Mobile only) */}
        <div className="relative shrink-0 md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`group relative w-[40px] h-[40px] flex items-center justify-center rounded-lg transition-colors ${isMenuOpen ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-100"}`}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            {!isMenuOpen && (
              <span className="absolute -bottom-10 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded shadow-sm whitespace-nowrap pointer-events-none z-50">
                설정 및 도구
              </span>
            )}
          </button>
          
          {isMenuOpen && (
            <div className="absolute top-14 right-0 w-max min-w-[240px] max-w-[calc(100vw-32px)] bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-4 border border-slate-200/60 animate-in slide-in-from-top-4 fade-in duration-200">
              <h3 className="text-sm font-semibold text-slate-500 mb-3 px-1">설정 및 도구</h3>
              <SettingsPanel isMobile={true} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tools */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-3 border border-slate-200/50 z-20">
        <ToolButton
          active={activeTool === "select"}
          onClick={() => setTool("select")}
          icon={<MousePointer2 size={24} strokeWidth={1.5} />}
          label="선택"
          shortcut="A"
        />
        <div className="w-px h-10 bg-slate-200 mx-1 md:mx-2"></div>
        <ToolButton
          active={activeTool === "point"}
          onClick={() => setTool("point")}
          icon={
            <div className="w-2.5 h-2.5 rounded-full bg-current m-[10.5px]" />
          }
          label="점"
          shortcut="S"
        />
        <ToolButton
          active={activeTool === "line"}
          onClick={() => setTool("line")}
          icon={<Slash size={24} strokeWidth={1.5} />}
          label="선"
          shortcut="D"
        />
        <ToolButton
          active={activeTool === "compass"}
          onClick={() => setTool("compass")}
          icon={<DraftingCompass size={24} strokeWidth={1.5} />}
          label="컴퍼스"
          shortcut="F"
        />
        <div className="w-px h-10 bg-slate-200 mx-1 md:mx-2"></div>
        <ToolButton
          active={activeTool === "pan"}
          onClick={() => setTool("pan")}
          icon={<Hand size={24} strokeWidth={1.5} />}
          label="이동"
          shortcut="Space"
        />
      </div>
    </>
  );
};

const ToolButton = ({ active, onClick, icon, label, shortcut }: any) => {
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
        {shortcut && <span className="ml-1 text-slate-400">({shortcut})</span>}
      </span>
    </div>
  );
};
