const fs = require('fs');
const files = ['app/admin/lottery/page.tsx', 'src/components/lottery/LotteryDrawSection.tsx'];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(f, content);
});
console.log('Fixed files');
