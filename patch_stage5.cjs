const fs = require('fs');
let code = fs.readFileSync('src/utils/stage5Validators.ts', 'utf8');

code = code.replace(
  /const distV = distancePointToInfiniteLine\(V, p1, p2\);\s*if \(distV < EPSILON_DIST\) \{/g,
  `const distV = distancePointToInfiniteLine(V, p1, p2);
      let startsNearV = false;
      if (line.type === "segment") {
         startsNearV = distance(V, p1) < EPSILON_DIST || distance(V, p2) < EPSILON_DIST;
      } else {
         startsNearV = distV < EPSILON_DIST;
      }
      
      if (startsNearV) {`
);

fs.writeFileSync('src/utils/stage5Validators.ts', code);
