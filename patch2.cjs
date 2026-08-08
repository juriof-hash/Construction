const fs = require('fs');
let code = fs.readFileSync('src/utils/stage5Generators.ts', 'utf8');

code = code.replace(/a1\)/g, 'angle1)');
code = code.replace(/a2\)/g, 'angle2)');
code = code.replace(/a3\)/g, 'angle3)');

fs.writeFileSync('src/utils/stage5Generators.ts', code);
