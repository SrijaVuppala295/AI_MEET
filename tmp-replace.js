const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            // Replace text color from white to dark
            content = content.replace(/color:\s*"#fff"/g, 'color: "#0f172a"');
            content = content.replace(/color:\s*"#ffffff"/g, 'color: "#0f172a"');
            
            // Replace background from dark hexes (near black) to white, except in globals.css which we already did
            content = content.replace(/background:\s*"#08090D"/g, 'background: "#ffffff"');
            content = content.replace(/background:\s*"#06080f"/g, 'background: "#ffffff"');
            
            // Replace SVG white stroke/fill with dark stroke/fill
            content = content.replace(/stroke="#fff"/g, 'stroke="#0f172a"');
            content = content.replace(/fill="#fff"/g, 'fill="#0f172a"');
            
            // Convert rgba(255,255,255, alpha) to rgba(0,0,0, alpha)
            content = content.replace(/rgba\(255,\s*255,\s*255,/g, 'rgba(0, 0, 0,');
            
            // Convert bg-white/10 to bg-black/5
            content = content.replace(/bg-white\/(5|10|20)/g, 'bg-black/5');
            // Convert border-white/20 to border-black/10
            content = content.replace(/border-white\/(5|10|20)/g, 'border-black/10');
            
            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated ' + fullPath);
            }
        }
    }
}

processDir(path.join(process.cwd(), 'app'));
processDir(path.join(process.cwd(), 'components'));
