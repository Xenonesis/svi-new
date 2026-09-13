const fs = require('fs');
const path = require('path');

const templatesPath = path.join(__dirname, '../src/data/email-templates.json');
const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));

console.log('Total current templates:', templates.length);
console.log('Categories:', [...new Set(templates.map(t => t.category))]);
