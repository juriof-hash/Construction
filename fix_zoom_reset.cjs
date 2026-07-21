const fs = require('fs');
let code = fs.readFileSync('src/components/GeometryApp.tsx', 'utf8');

code = code.replace(
  'dispatch({ type: "SET_VIEW", payload: { x: -winSize.width / 2, y: -winSize.height / 2, scale: 1 } });',
  'dispatch({ type: "SET_VIEW", payload: { x: 0, y: 0, scale: 1 } });'
);

code = code.replace(
  'const center = { x: winSize.width / 2, y: winSize.height / 2 };',
  'const center = { x: winSize.w / 2, y: winSize.h / 2 };'
);

code = code.replace(
  'const center = { x: winSize.width / 2, y: winSize.height / 2 };',
  'const center = { x: winSize.w / 2, y: winSize.h / 2 };'
);

fs.writeFileSync('src/components/GeometryApp.tsx', code);
