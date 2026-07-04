const fs = require('fs');
const path = require('path');

const moves = [
  { file: 'AboutFAQ.tsx', from: 'common', to: 'faq' },
  { file: 'ContactFAQ.tsx', from: 'common', to: 'faq' },
  { file: 'FAQSection.tsx', from: 'common', to: 'faq' },
  { file: 'ProjectsFAQ.tsx', from: 'common', to: 'faq' },
  { file: 'RegistrationFAQ.tsx', from: 'common', to: 'faq' },
  { file: 'PropertyCalculator.tsx', from: 'common', to: 'properties' },
  { file: 'AnimatedSection.tsx', from: 'common', to: 'ui' },
  { file: 'HoverZoomImage.tsx', from: 'common', to: 'ui' },
  { file: 'ReadingProgress.tsx', from: 'common', to: 'ui' },
  { file: 'StatsCounter.tsx', from: 'common', to: 'ui' },
];

const basePath = path.join(__dirname, 'src', 'components');

moves.forEach((m) => {
  const fromDir = path.join(basePath, m.from);
  const toDir = path.join(basePath, m.to);
  const fromPath = path.join(fromDir, m.file);
  const toPath = path.join(toDir, m.file);

  if (!fs.existsSync(toDir)) {
    fs.mkdirSync(toDir, { recursive: true });
  }

  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
    console.log(`Moved ${m.file} from ${m.from} to ${m.to}`);
  }
});

// Update imports
function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const allFiles = [...walk('app'), ...walk('src')];

allFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  moves.forEach((m) => {
    const importRegex = new RegExp(`@/src/components/${m.from}/${m.file.replace('.tsx', '')}`, 'g');
    if (importRegex.test(content)) {
      content = content.replace(
        importRegex,
        `@/src/components/${m.to}/${m.file.replace('.tsx', '')}`
      );
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated imports in ${file}`);
  }
});
