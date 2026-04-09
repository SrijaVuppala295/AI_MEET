const fs = require('fs');
const path = require('path');

const targets = [
    'components/ProfileUI.tsx',
    'components/AuthForm.tsx',
    'app/(root)/quiz/page.tsx',
    'app/(root)/questions/page.tsx',
    'app/(root)/prep-hub/page.tsx',
    'app/(root)/interview/page.tsx',
    'app/(root)/interview/[sessionId]/page.tsx'
];

const patterns = [
    // 1. Solid pitch black
    { search: /background:\s*["']#0d0f18["']/g, replace: 'background: "#ffffff"' },
    { search: /background:\s*["']#08090d["']/g, replace: 'background: "#ffffff"' },
    { search: /background:\s*["']#020617["']/g, replace: 'background: "#ffffff"' },
    { search: /background:\s*["']#0d1117["']/g, replace: 'background: "#ffffff"' },
    { search: /bg-\[\#020617\]/g, replace: 'bg-white' },

    // 2. Translucent dark boxes (grey panels) -> Convert to light gray or white
    { search: /rgba\(20,\s*22,\s*32,\s*0\.\d+\)/g, replace: 'rgba(255,255,255,0.9)' },
    { search: /rgba\(10,\s*11,\s*16,\s*0\.\d+\)/g, replace: 'rgba(240,240,240,1)' },
    { search: /rgba\(10,\s*11,\s*16,\s*1\)/g, replace: 'rgba(240,240,240,1)' },
    { search: /rgba\(25,\s*27,\s*38,\s*0\.\d+\)/g, replace: 'rgba(245,245,245,1)' },
    { search: /rgba\(15,\s*16,\s*22,\s*0\.\d+\)/g, replace: 'rgba(235,235,235,1)' },
    { search: /rgba\(15,\s*23,\s*42,\s*0\.\d+\)/g, replace: 'rgba(248,250,252,0.8)' }, // Slate 900 -> Slate 50
    { search: /rgba\(20,\s*20,\s*25,\s*0\.\d+\)/g, replace: 'rgba(255,255,255,1)' },

    // 3. Dark Tailwind classes masking as background
    { search: /bg-slate-950\/90/g, replace: 'bg-white/90' },
    { search: /bg-slate-900\/40/g, replace: 'bg-slate-50' },
    { search: /bg-slate-900\/60/g, replace: 'bg-slate-50/80 border border-slate-200' },
    { search: /bg-slate-900\/10/g, replace: 'bg-slate-50' },
    { search: /bg-slate-800/g, replace: 'bg-slate-200' },
    { search: /bg-slate-900/g, replace: 'bg-white' },
    { search: /bg-slate-950\/30/g, replace: 'bg-white/50' },
    { search: /bg-slate-950\/60/g, replace: 'bg-white/80' },

    // 4. White text / invisible text on white background -> Convert to slate-900
    { search: /text-white-300/g, replace: 'text-slate-800' },
    { search: /text-slate-100/g, replace: 'text-slate-900' },
    { search: /text-slate-200/g, replace: 'text-slate-800' },
    { search: /text-slate-300/g, replace: 'text-slate-700' },
    { search: /text-slate-400/g, replace: 'text-slate-600' },
    { search: /text-slate-500/g, replace: 'text-slate-600' },
    
    // Fix pure white gradient text breaking against white bg
    { search: /linear-gradient\(135deg,\s*#fff\s*30%,\s*#c4b5fd\s*100%\)/g, replace: 'linear-gradient(135deg, #0f172a 30%, #4f46e5 100%)' },
    { search: /color:\s*["']#f1f5f9["']/gi, replace: 'color: "#0f172a"' },
    { search: /from-blue-900\/20 via-slate-950 to-slate-950/g, replace: 'from-blue-50/50 via-white to-white' }
];

targets.forEach(relPath => {
    const fullPath = path.join(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let initial = content;

        patterns.forEach(p => {
            content = content.replace(p.search, p.replace);
        });

        if (content !== initial) {
            fs.writeFileSync(fullPath, content);
            console.log(`Updated UI for ${relPath}`);
        } else {
            console.log(`No changes needed in ${relPath}`);
        }
    } else {
        console.warn(`File missing: ${relPath}`);
    }
});
