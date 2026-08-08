const fs = require('fs');

let toolCode = fs.readFileSync('src/types/tool.ts', 'utf8');
toolCode = toolCode.replace(
  'onPointerLeave?: (e: PointerEvent<SVGSVGElement>) => void;',
  'onPointerLeave?: (e: PointerEvent<SVGSVGElement>) => void;\n  onPointerCancel?: (e: PointerEvent<SVGSVGElement>) => void;'
);
fs.writeFileSync('src/types/tool.ts', toolCode);

let genCode = fs.readFileSync('src/utils/stage5Generators.ts', 'utf8');
genCode = genCode.replace(/rng\.next\(\)/g, 'rng.nextFloat()');
genCode = genCode.replace(/safeGenerate\(\s*\(\) =>/g, 'safeGenerate(rng, () =>');
fs.writeFileSync('src/utils/stage5Generators.ts', genCode);

