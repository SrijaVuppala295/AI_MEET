const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'components/AuthForm.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Container background
content = content.replace(/className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-dark-100"/g, 'className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#ffffff]"');

// 2. Card Background & Shadow
content = content.replace(/background: "linear-gradient\(145deg, rgba\(36,38,51,0\.95\) 0%, rgba\(8,9,13,0\.98\) 100%\)"/g, 'background: "#ffffff"');
content = content.replace(/boxShadow: "0 0 0 1px rgba\(99,102,241,0\.05\), 0 32px 64px rgba\(0,0,0,0\.6\), 0 0 80px rgba\(99,102,241,0\.08\)"/g, 'boxShadow: "0 20px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)"');

// 3. Brand Text Background
content = content.replace(/background: "linear-gradient\(135deg, #e0e7ff, #c4b5fd\)"/g, 'background: "linear-gradient(135deg, #4f46e5, #7c3aed)"');

// 4. Input Style Text Color and Border
content = content.replace(/color: "#e0e7ff"/g, 'color: "#0f172a"');
content = content.replace(/background: "rgba\(0, 0, 0,0\.04\)"/g, 'background: "#f8fafc"');
content = content.replace(/border: "1px solid rgba\(99,102,241,0\.15\)"/g, 'border: "1px solid rgba(0,0,0,0.08)"');

// 5. Submit Button Text Color (making it readable)
content = content.replace(/color: "#0f172a"/g, 'color: "#ffffff"'); // Change button text to white if background is indigo

// 6. Social Login Buttons Text Color
content = content.replace(/color: "#e0e7ff"/gi, 'color: "#0f172a"');

// 7. Divider and Footer
content = content.replace(/background: "rgba\(0, 0, 0,0\.06\)"/g, 'background: "rgba(0,0,0,0.1)"');
content = content.replace(/style=\{\{ color: "#818cf8" \}\}/g, 'className="text-indigo-600"');

fs.writeFileSync(file, content);
console.log("Fixed AuthForm.tsx UI");
