const fs = require('fs');
let code = fs.readFileSync('src/hooks/tools/useCompassTool.tsx', 'utf8');

code = code.replace(
  /const onPointerDown = useCallback\(\s*\(e: React\.PointerEvent<SVGSVGElement>\) => \{\s*if \(!active\) return;\s*const \{ pt \} = getWorldCoords\(e, gRef\);\s*const \{ pt: snapPt \} = getSnap\(pt\);\s*if \(step === "NEEDLE"\) \{\s*setCenter\(snapPt\);\s*setStep\("PENCIL"\);\s*\} else if \(step === "PENCIL"\) \{\s*const isRightClick = e\.button === 2;\s*if \(isRightClick\) \{\s*setCenter\(snapPt\);\s*isMovingCenterRef\.current = true;\s*return;\s*\}\s*const radiusDist = distance\(center!, snapPt\);\s*if \(radiusDist === 0\) return;\s*\/\/\s*Ignore zero radius\s*setRadiusPt\(snapPt\);\s*setR\(radiusDist\);\s*setStep\("SWEEP"\);\s*\} else if \(step === "SWEEP"\) \{/,
  `const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!active) return;
      if (!e.isPrimary) {
        setStep("NEEDLE");
        setCenter(null);
        setRadiusPt(null);
        setR(0);
        isStartedRef.current = false;
        dragState.current.isDown = false;
        return;
      }
      const { pt } = getWorldCoords(e, gRef);
      const { pt: snapPt } = getSnap(pt);
      dragState.current.isDown = true;
      dragState.current.hasDragged = false;
      dragState.current.rawDownPt = pt;
      if (step === "NEEDLE") {
        setCenter(snapPt);
        setStep("PENCIL");
        dragState.current.isNewStart = true;
      } else if (step === "PENCIL") {
        const isRightClick = e.button === 2;
        if (isRightClick) {
          setCenter(snapPt);
          isMovingCenterRef.current = true;
          return;
        }
        dragState.current.isNewStart = false;
      } else if (step === "SWEEP") {`
);

code = code.replace(
  /const onPointerMove = useCallback\(\s*\(e: React\.PointerEvent<SVGSVGElement>\) => \{\s*if \(!active\) return;\s*const \{ pt \} = getWorldCoords\(e, gRef\);\s*const \{ pt: snapPt, snapped \} = getSnap\(pt\);\s*setHoverPt\(\{ pt: snapPt, snapped \}\);\s*if \(activeMode === "touch"\) \{/,
  `const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!active || !e.isPrimary) return;
      const { pt } = getWorldCoords(e, gRef);
      const { pt: snapPt, snapped } = getSnap(pt);
      setHoverPt({ pt: snapPt, snapped });
      if (dragState.current.isDown && dragState.current.rawDownPt) {
        const dist = Math.hypot(pt.x - dragState.current.rawDownPt.x, pt.y - dragState.current.rawDownPt.y);
        if (dist > 10 / scale) {
          dragState.current.hasDragged = true;
        }
      }
      if (activeMode === "touch") {`
);

code = code.replace(
  /const onPointerUp = useCallback\(\s*\(e: React\.PointerEvent<SVGSVGElement>\) => \{\s*if \(!active\) return;\s*setLastTouchCoords\(null\);\s*if \(isMovingCenterRef\.current\) \{\s*isMovingCenterRef\.current = false;\s*return;\s*\}\s*if \(step === "SWEEP" && isStartedRef\.current\) \{/,
  `const onPointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!active || !e.isPrimary) return;
      dragState.current.isDown = false;
      setLastTouchCoords(null);
      if (isMovingCenterRef.current) {
        isMovingCenterRef.current = false;
        return;
      }
      const { pt } = getWorldCoords(e, gRef);
      const { pt: snapPt } = getSnap(pt);
      if (step === "PENCIL") {
        if (dragState.current.hasDragged || !dragState.current.isNewStart) {
          const radiusDist = distance(center!, snapPt);
          if (radiusDist > 1e-4) {
            setRadiusPt(snapPt);
            setR(radiusDist);
            setStep("SWEEP");
          } else {
            setStep("NEEDLE");
            setCenter(null);
          }
        } else {
          dragState.current.isNewStart = false;
        }
      } else if (step === "SWEEP" && isStartedRef.current) {`
);

fs.writeFileSync('src/hooks/tools/useCompassTool.tsx', code);
