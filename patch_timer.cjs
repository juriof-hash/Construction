const fs = require('fs');

let code = fs.readFileSync('src/components/ChallengeModeUI.tsx', 'utf8');

code = code.replace(
  /timerRef\.current = setInterval\(\(\) => \{\n\s*setElapsedSec\(\(prev\) => prev \+ 1\);\n\s*\}, 1000\);/g,
  `timerRef.current = setInterval(() => {
        setElapsedSec((prev) => +(prev + 0.1).toFixed(1));
      }, 100);`
);

code = code.replace(
  /\{elapsedSec\}/g,
  `{elapsedSec.toFixed(1)}`
);

fs.writeFileSync('src/components/ChallengeModeUI.tsx', code);
