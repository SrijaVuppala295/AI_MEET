const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const [search, replace] of replacements) {
        content = content.replace(search, replace);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

// Fix Header
replaceInFile(path.join(process.cwd(), 'components', 'Header.tsx'), [
    [/rgba\(8,9,13,0\.92\)/g, "rgba(255,255,255,0.92)"],
    [/rgba\(8,9,13,0\.5\)/g, "rgba(255,255,255,0.5)"],
    [/linear-gradient\(145deg, rgba\(36,38,51,0\.98\), rgba\(8,9,13,0\.99\)\)/g, "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.99))"],
    [/color:\s*["']#d6e0ff["']/gi, 'color: "#0f172a"'],
    [/color:\s*["']#f1f5f9["']/gi, 'color: "#0f172a"']
]);

// Fix HomePage Hero Headline
const hpPath = path.join(process.cwd(), 'components', 'HomePage.tsx');
let hpContent = fs.readFileSync(hpPath, 'utf8');
hpContent = hpContent.replace(
    /className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl"/g,
    'className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl text-slate-900"'
);
hpContent = hpContent.replace(
    /style=\{\{\s*background:\s*"linear-gradient\(135deg, #1e1b4b 0%, #c4b5fd 50%, #818cf8 100%\)",\s*WebkitBackgroundClip:\s*"text",\s*WebkitTextFillColor:\s*"transparent",\s*\}\}/g,
    'style={{}}'
);
fs.writeFileSync(hpPath, hpContent);
console.log(`Updated HomePage`);

// Fix AIChatbot
replaceInFile(path.join(process.cwd(), 'components', 'AIChatbot.tsx'), [
    [/background:\s*["']#0d0f18["']/g, 'background: "#ffffff"'],
    [/color:\s*#fff/g, 'color: #0f172a'],
    [/color:\s*["']#fff["']/gi, 'color: "#0f172a"'],
    [/color:\s*#e2e8f0/g, 'color: #0f172a'],
    [/color:\s*["']#e2e8f0["']/gi, 'color: "#0f172a"'],
    [/color:\s*["']#f1f5f9["']/gi, 'color: "#0f172a"'],
    [/background:\s*rgba\(0,0,0,0\.3\)/g, 'background: rgba(240,240,240,0.8)'],
    [/color:\s*#a5b4fc/g, 'color: #4f46e5'],
    [/color:\s*["']#a5b4fc["']/gi, 'color: "#4f46e5"'],
    [/border:\s*["']1px solid rgba\(0, 0, 0,0\.3\)["']/g, 'border: "1px solid rgba(0,0,0,0.06)"'],
    [/color:\s*["']#d6e0ff["']/gi, 'color: "#0f172a"']
]);
