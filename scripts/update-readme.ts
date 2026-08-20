import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const README_PATH = 'README.md';
const CHECKS = [
  { pattern: '/admin/updates', label: 'Admin updates route' },
  { pattern: '/admin/whatsapp', label: 'WhatsApp admin route' },
  { pattern: '/admin/quotation-records', label: 'Quotation records route' },
  { pattern: 'AIComposePopover', label: 'AI compose popover' },
  { pattern: 'System updates', label: 'System updates section' },
];

function main() {
  let readme = readFileSync(README_PATH, 'utf-8');
  let updated = false;
  const missing: string[] = [];

  for (const check of CHECKS) {
    if (!readme.includes(check.pattern)) {
      missing.push(check.label);
    }
  }

  if (missing.length > 0) {
    console.error('README.md is missing references for: ' + missing.join(', '));
    console.error('Update README.md before pushing.');
    process.exit(1);
  }

  // Ensure README.md is staged if there are other staged changes
  try {
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf-8' }).trim();
    const hasCodeChanges = staged.split('\n').some((f) => f && !f.startsWith('README.md'));
    const readmeStaged = staged.split('\n').some((f) => f === 'README.md');

    if (hasCodeChanges && !readmeStaged) {
      console.error('Code changes are staged but README.md is not.');
      console.error('Stage README.md after updating it, or run: git add README.md');
      process.exit(1);
    }
  } catch {
    // git not available; skip staged check
  }

  console.log('README.md is up to date.');
}

main();
