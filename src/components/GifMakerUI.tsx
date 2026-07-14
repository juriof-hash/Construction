import React from "react";
import { Camera, Film, Trash2, Loader2 } from "lucide-react";

interface GifMakerUIProps {
  frameCount: number;
  isProcessing: boolean;
  progress: number;
  onCreateGif: () => void;
  onClear: () => void;
}

export const GifMakerUI: React.FC<GifMakerUIProps> = ({
  frameCount,
  isProcessing,
  progress,
  onCreateGif,
  onClear,
}) => {
  if (frameCount === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-50 bg-white shadow-lg border border-slate-200 rounded-xl p-3 flex flex-col gap-3 min-w-[200px] animate-in slide-in-from-right-8">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Film size={16} className="text-indigo-500" />
          GIF 프레임: {frameCount}장
        </span>
        <button
          onClick={onClear}
          disabled={isProcessing}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="초기화"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <button
        onClick={onCreateGif}
        disabled={isProcessing}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
      >
        {isProcessing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            생성 중... {progress}%
          </>
        ) : (
          <>
            <Camera size={16} />
            GIF 만들기
          </>
        )}
      </button>
    </div>
  );
};
