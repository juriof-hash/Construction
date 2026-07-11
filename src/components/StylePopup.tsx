import React, { useState, useEffect } from 'react';
import { GeomId, GeometryStyle } from '../types/geometry';
import { Trash2 } from 'lucide-react';

interface StylePopupProps {
  x: number;
  y: number;
  style: GeometryStyle;
  label?: string;
  disableLabelEdit?: boolean;
  onLabelCommit?: (label: string) => void;
  onChange: (style: Partial<GeometryStyle>) => void;
  onCommit: (style: Partial<GeometryStyle>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const COLORS = ['#1e293b', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const StylePopup = ({ x, y, style, label, disableLabelEdit, onLabelCommit, onChange, onCommit, onDelete, onClose }: StylePopupProps) => {
  const [localWidth, setLocalWidth] = useState(style.strokeWidth || 2);
  const [localLabel, setLocalLabel] = useState(label || '');

  // Sync local state if external style changes
  useEffect(() => {
    setLocalWidth(style.strokeWidth || 2);
  }, [style.strokeWidth]);
  
  useEffect(() => {
    setLocalLabel(label || '');
  }, [label]);

  const handleLabelCommit = () => {
    if (onLabelCommit && localLabel.trim() !== (label || '')) {
      onLabelCommit(localLabel);
    }
  };

  return (
    <div 
      className="fixed z-50 bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-4 border border-slate-200/60 w-64 md:w-72"
      style={{ left: Math.min(x, window.innerWidth - 290), top: Math.min(y, window.innerHeight - 200) }}
    >
      <div className="flex flex-col gap-4">
        {/* Label (if point) */}
        {label !== undefined && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">이름 (Label)</label>
            <input 
              type="text"
              value={localLabel}
              onChange={(e) => setLocalLabel(e.target.value.toUpperCase())}
              onBlur={handleLabelCommit}
              onKeyDown={(e) => e.key === 'Enter' && handleLabelCommit()}
              disabled={disableLabelEdit}
              maxLength={3}
              placeholder="이름"
              className={`w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 ${disableLabelEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        )}

        {/* Colors */}
        <div className="flex justify-between items-center">
          {COLORS.map(c => (
            <button 
              key={c}
              className={`w-6 h-6 rounded-full border-2 ${style.color === c ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-110'} transition-transform`}
              style={{ backgroundColor: c }}
              onClick={() => onCommit({ color: c })}
            />
          ))}
        </div>

        {/* Thickness */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500">두께 (Thickness)</label>
          <input 
            type="range" 
            min="1" max="10" step="1"
            value={localWidth}
            onChange={(e) => {
              const val = Number(e.target.value);
              setLocalWidth(val);
              onChange({ strokeWidth: val }); // Real-time preview without history
            }}
            onMouseUp={() => onCommit({ strokeWidth: localWidth })}
            onTouchEnd={() => onCommit({ strokeWidth: localWidth })}
            className="w-full accent-slate-800"
          />
        </div>

        {/* Dash Style & Actions */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button 
              className={`px-3 py-1 text-sm font-medium rounded ${!style.dashStyle || style.dashStyle === 'solid' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => onCommit({ dashStyle: 'solid' })}
            >—</button>
            <button 
              className={`px-3 py-1 text-sm font-medium rounded ${style.dashStyle === 'dashed' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => onCommit({ dashStyle: 'dashed' })}
            >---</button>
          </div>
          
          <div className="flex gap-2">
            {onDelete && (
              <button 
                onClick={onDelete}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="삭제"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button 
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
