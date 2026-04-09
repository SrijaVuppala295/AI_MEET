const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'components/ProfileUI.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/background: "linear-gradient\(145deg, rgba\(30,32,44,0\.9\), rgba\(15,17,26,0\.95\)\)"/g, 'background: "#f8fafc"');
content = content.replace(/text-gray-400/g, 'text-slate-600');
content = content.replace(/text-gray-500/g, 'text-slate-500');
content = content.replace(/rgba\(15,\s*23,\s*42,\s*0\.6\)/g, 'rgba(255,255,255,1)');
content = content.replace(/#1e1b4b/g, '#f8fafc');
content = content.replace(/#08090d/g, '#ffffff');

fs.writeFileSync(file, content);
console.log("Fixed ProfileUI.tsx");
