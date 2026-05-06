const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'components'),
  path.join(__dirname, 'app'),
];

const replacements = [
  // Text Opacities
  { regex: /text-\[var\(--color-text-primary\)\]\/(60|70|80)/g, replacement: 'text-[var(--color-text-secondary)]' },
  { regex: /text-\[var\(--color-text-primary\)\]\/(40|50)/g, replacement: 'text-[var(--color-text-muted)]' },
  
  // Background Opacities
  { regex: /bg-\[var\(--color-bg\)\]\/80/g, replacement: 'bg-[var(--color-bg-transparent)]' },
  { regex: /bg-\[var\(--color-surface\)\]\/80/g, replacement: 'bg-[var(--color-surface-transparent)]' },
  { regex: /bg-\[var\(--color-surface\)\]\/50/g, replacement: 'bg-[var(--color-surface-transparent)]' },
  
  // Border Opacities
  { regex: /border-\[var\(--color-border\)\]\/(10|20|30|50)/g, replacement: 'border-[var(--color-border)]' },
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
console.log('Done Migrating 3');
