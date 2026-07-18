const fs = require('fs');
let code = fs.readFileSync('src/hooks/tools/useCompassTool.tsx', 'utf8');

code = code.replace(
  /handlers: \{ onPointerDown, onPointerMove, onPointerUp \},/,
  'handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },'
);

code = code.replace(
  /const preview = \(/,
  `const onPointerCancel = useCallback(() => {
    dragState.current.isDown = false;
    setStep("NEEDLE");
    setCenter(null);
    setRadiusPt(null);
    setR(0);
    isStartedRef.current = false;
    setRenderSweep({ startAngle: 0, totalSweep: 0 });
    setLastTouchCoords(null);
  }, []);

  const preview = (`
);

fs.writeFileSync('src/hooks/tools/useCompassTool.tsx', code);
