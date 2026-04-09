const fs = require('fs');
const path = require('path');

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            // HomePage and others dark card gradients
            content = content.replace(/linear-gradient\(145deg, rgba\(36,38,51,0\.7\), rgba\(8,9,13,0\.8\)\)/g, 'linear-gradient(145deg, #ffffff, #f8fafc)');
            content = content.replace(/linear-gradient\(145deg, rgba\(36,38,51,0\.8\), rgba\(8,9,13,0\.9\)\)/g, 'linear-gradient(145deg, #ffffff, #f1f5f9)');
            content = content.replace(/linear-gradient\(135deg, #1e1b4b 0%, #2d1b69 50%, #1e1b4b 100%\)/g, 'linear-gradient(135deg, #f0fdf4 0%, #e0e7ff 50%, #f8fafc 100%)');
            
            // Header specific dark backgrounds
            content = content.replace(/background:\s*["']rgba\(15, 23, 42, 0.95\)["']/g, 'background: "rgba(255, 255, 255, 0.95)"');
            content = content.replace(/background:\s*["']#0f172a["']/g, 'background: "#ffffff"');
            
            // Generic dark rgba box backgrounds used in ProfileUI/Quiz etc
            content = content.replace(/rgba\(36,38,51,0\.8\)/g, 'rgba(255,255,255,0.8)');
            content = content.replace(/rgba\(36,\s*38,\s*51,\s*0\.8\)/g, 'rgba(255,255,255,0.8)');
            content = content.replace(/rgba\(8,9,13,0\.8\)/g, 'rgba(240,240,240,0.8)');
            content = content.replace(/rgba\(0,\s*0,\s*0,\s*0\.08\)/g, 'rgba(0,0,0,0.03)'); // make borders lighter
            
            // Ensure any "style={{ background: '#1c1c24'..." becomes white
            content = content.replace(/background:\s*['"]#1[a-f0-9]{5}['"]/gi, 'background: "#ffffff"');
            content = content.replace(/background:\s*['"]#2[a-f0-9]{5}['"]/gi, 'background: "#f8fafc"');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated ' + fullPath);
            }
        }
    }
}

processDir(path.join(process.cwd(), 'app'));
processDir(path.join(process.cwd(), 'components'));
