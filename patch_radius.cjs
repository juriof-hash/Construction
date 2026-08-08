const fs = require('fs');
let code = fs.readFileSync('src/utils/stage5Validators.ts', 'utf8');

code = code.replace(
  'EPSILON_RADIUS: Math.max(5, maxDist * 0.03),',
  'EPSILON_RADIUS: Math.max(5, maxDist * 0.04),'
);

fs.writeFileSync('src/utils/stage5Validators.ts', code);
