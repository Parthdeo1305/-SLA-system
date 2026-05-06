const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'components'),
  path.join(__dirname, 'app'),
];

const replacements = [
  // Status Badges
  { regex: /\bbg-slate-800 text-slate-300 border-slate-700\b/g, replacement: 'bg-[var(--badge-created-bg)] text-[var(--badge-created-text)] border-[var(--badge-created-border)]' },
  { regex: /\bbg-blue-950 text-blue-300 border-blue-800\b/g, replacement: 'bg-[var(--badge-picked-bg)] text-[var(--badge-picked-text)] border-[var(--badge-picked-border)]' },
  { regex: /\bbg-amber-950 text-amber-300 border-amber-800\b/g, replacement: 'bg-[var(--badge-transit-bg)] text-[var(--badge-transit-text)] border-[var(--badge-transit-border)]' },
  { regex: /\bbg-emerald-950 text-emerald-300 border-emerald-800\b/g, replacement: 'bg-[var(--badge-delivered-bg)] text-[var(--badge-delivered-text)] border-[var(--badge-delivered-border)]' },
  { regex: /\bbg-red-950 text-red-400 border-red-900\b/g, replacement: 'bg-[var(--badge-failed-bg)] text-[var(--badge-failed-text)] border-[var(--badge-failed-border)]' },
  
  // Accents / Colors
  { regex: /\bbg-red-950\/40\b/g, replacement: 'bg-[var(--color-danger-bg)]' },
  { regex: /\border-red-500\b/g, replacement: 'border-[var(--color-danger-border)]' },
  { regex: /\bbg-red-950\/20\b/g, replacement: 'bg-[var(--color-danger-bg-subtle)]' },
  { regex: /\border-red-900\/30\b/g, replacement: 'border-[var(--color-border)]' },
  { regex: /\btext-red-400\b/g, replacement: 'text-[var(--color-danger-text)]' },
  { regex: /\bbg-red-950\/10\b/g, replacement: 'bg-[var(--color-danger-bg-subtle)]' },
  { regex: /\bbg-red-400\/10\b/g, replacement: 'bg-[var(--color-danger-bg-subtle)]' },
  { regex: /\border-red-400\/20\b/g, replacement: 'border-[var(--color-danger-border)]' },
  
  { regex: /\bbg-indigo-950\/40\b/g, replacement: 'bg-[var(--color-brand-bg)]' },
  { regex: /\bbg-indigo-500\/10\b/g, replacement: 'bg-[var(--color-brand-bg)]' },
  { regex: /\border-indigo-500\/20\b/g, replacement: 'border-[var(--color-brand-border)]' },
  { regex: /\btext-indigo-400\b/g, replacement: 'text-[var(--color-brand-text)]' },
  { regex: /\btext-indigo-500\b/g, replacement: 'text-[var(--color-brand-text)]' },
  { regex: /\btext-indigo-600\b/g, replacement: 'text-[var(--color-brand-text)]' },

  { regex: /\btext-amber-400\b/g, replacement: 'text-[var(--badge-transit-text)]' },
  { regex: /\btext-emerald-400\b/g, replacement: 'text-[var(--badge-delivered-text)]' },
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
console.log('Done Migrating 2');
