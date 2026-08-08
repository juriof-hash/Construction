const fs = require('fs');

for (let i = 1; i <= 3; i++) {
  const path = `src/missions/mission-5-${i}.ts`;
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(/"ref-l": "l"/g, '"l": "l"');
  code = code.replace(/"ref-P": "P"/g, '"P": "P"');
  code = code.replace(/"ref-A": "A"/g, '"A": "A"');
  code = code.replace(/"ref-B": "B"/g, '"B": "B"');
  code = code.replace(/"ref-C": "C"/g, '"C": "C"');
  fs.writeFileSync(path, code);
}
