const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'components'),
  path.join(__dirname, 'app'),
];

const replacements = [
  { regex: /\btext-white\b/g, replacement: 'text-[var(--color-text-primary)]' },
  { regex: /\bbg-white\/5\b/g, replacement: 'bg-[var(--color-surface-hover)]' },
  { regex: /\bbg-white\/10\b/g, replacement: 'bg-[var(--color-surface-hover)]' },
  { regex: /\bbg-white\/3\b/g, replacement: 'bg-[var(--color-surface-hover)]' },
  { regex: /\bborder-white\/5\b/g, replacement: 'border-[var(--color-border)]' },
  { regex: /\bborder-white\/10\b/g, replacement: 'border-[var(--color-border)]' },
  { regex: /\bborder-white\/20\b/g, replacement: 'border-[var(--color-border)]' },
  { regex: /\bbg-\[#0a0a0f\]/g, replacement: 'bg-[var(--color-bg)]' },
  { regex: /\bshadow-white\/10\b/g, replacement: 'shadow-[var(--color-border)]' },
  { regex: /\bhover:text-white\b/g, replacement: 'hover:text-[var(--color-text-primary)]' },
];

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const r of replacements) {
        if (r.regex.test(content)) {
          content = content.replace(r.regex, r.replacement);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Modified', fullPath);
      }
    }
  }
}

for (const dir of directories) {
  walkDir(dir);
}
console.log('Done');
