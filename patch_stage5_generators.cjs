const fs = require('fs');
let code = fs.readFileSync('src/utils/stage5Generators.ts', 'utf8');

const replacement = `      const cx = (rng.next() - 0.5) * 50;
      const cy = (rng.next() - 0.5) * 50;
      const r = 100 + rng.next() * 80;

      // Ensure variety: Acute, Right, Obtuse
      const type = rng.next();
      let angle1, angle2, angle3;
      
      const startAngle = rng.next() * Math.PI * 2;
      
      if (type < 0.33) {
         // Acute
         angle1 = startAngle;
         angle2 = angle1 + (Math.PI / 2 + rng.next() * 0.5);
         angle3 = angle2 + (Math.PI / 2 + rng.next() * 0.5);
      } else if (type < 0.66) {
         // Right
         angle1 = startAngle;
         angle2 = angle1 + Math.PI;
         angle3 = angle2 + (0.5 + rng.next() * 2);
      } else {
         // Obtuse
         angle1 = startAngle;
         angle2 = angle1 + (0.5 + rng.next() * 1.0);
         angle3 = angle2 + (0.5 + rng.next() * 1.0);
      }`;

code = code.replace(/const cx = \(rng\.next\(\) - 0\.5\) \* 50;[\s\S]*?if \(a3 - a1 >= Math\.PI \* 2 - 0\.5\) return null; \/\/ Prevent too flat/g, replacement);

fs.writeFileSync('src/utils/stage5Generators.ts', code);
