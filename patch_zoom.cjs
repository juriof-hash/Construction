const fs = require('fs');
let code = fs.readFileSync('src/components/GeometryApp.tsx', 'utf8');

code = code.replace(
  'import { GifMakerUI } from "./GifMakerUI";',
  'import { GifMakerUI } from "./GifMakerUI";\nimport { ZoomIn, ZoomOut, Expand } from "lucide-react";\nimport { zoomAroundPoint } from "../utils/viewportUtils";'
);

code = code.replace(
  '<AppOverlays',
  `
      {/* Zoom Controls */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-6 z-20 flex flex-col items-center gap-1 bg-white/90 backdrop-blur shadow-xl rounded-xl p-1 border border-slate-200/50">
        <button
          onClick={() => {
            const newScale = Math.min(10, view.scale * 1.5);
            const center = { x: winSize.width / 2, y: winSize.height / 2 };
            dispatch({ type: "SET_VIEW", payload: zoomAroundPoint(view, center, newScale) });
          }}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          title="확대 (Zoom In)"
        >
          <ZoomIn size={20} />
        </button>
        <div className="w-8 h-px bg-slate-200 mx-auto"></div>
        <button
          onClick={() => {
            const newScale = Math.max(0.1, view.scale / 1.5);
            const center = { x: winSize.width / 2, y: winSize.height / 2 };
            dispatch({ type: "SET_VIEW", payload: zoomAroundPoint(view, center, newScale) });
          }}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          title="축소 (Zoom Out)"
        >
          <ZoomOut size={20} />
        </button>
        <div className="w-8 h-px bg-slate-200 mx-auto"></div>
        <button
          onClick={() => {
            dispatch({ type: "SET_VIEW", payload: { x: -winSize.width / 2, y: -winSize.height / 2, scale: 1 } });
          }}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          title="원래 크기로 (Reset Zoom)"
        >
          <Expand size={20} />
        </button>
      </div>

      <AppOverlays`
);

fs.writeFileSync('src/components/GeometryApp.tsx', code);
