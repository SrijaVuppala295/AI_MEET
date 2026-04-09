const fs = require('fs');
const path = require('path');

const suspiciousPatterns = [
    { regex: /bg-(slate|gray|zinc|neutral)-(800|900|950)/g, label: "Dark Background Class" },
    { regex: /text-(slate|gray|zinc|neutral)-(100|200|300)/g, label: "Light Text Class" },
    { regex: /text-white/g, label: "White Text Class" },
    { regex: /color:\s*["']#f[a-f0-9]{5}["']/gi, label: "White/Light inline color" },
    { regex: /background:\s*["']#[0-2][a-f0-9]{5}["']/gi, label: "Dark inline background hex" },
    { regex: /background:\s*["']rgba\(\s*[0-3][0-9]?\s*,\s*[0-3][0-9]?\s*,\s*[0-3][0-9]?\s*,[^)]+\)["']/gi, label: "Dark inline background rgba" },
    { regex: /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.\d+\s*\)/g, label: "White rgba border/background" },
    { regex: /linear-gradient\([^)]+#[0-2][a-f0-9]{5}[^)]+\)/gi, label: "Dark inline gradient" }
];

let totalFindings = 0;

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let foundInFile = false;
            
            for (const pattern of suspiciousPatterns) {
                const matches = content.match(pattern.regex);
                if (matches) {
                    if (!foundInFile) {
                        console.log(`\n📄 ${fullPath}`);
                        foundInFile = true;
                    }
                    console.log(`  - [${pattern.label}]: ${[...new Set(matches)].join(', ')}`);
                    totalFindings += matches.length;
                }
            }
        }
    }
}

console.log("Starting scan...");
scanDir(path.join(process.cwd(), 'app'));
scanDir(path.join(process.cwd(), 'components'));
console.log(`\nTotal suspicious matches found: ${totalFindings}`);
