import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('Navigating to brochure page...');
  await page.goto('http://localhost:3001/en/brochure/shivani-vatika-11', { waitUntil: 'load', timeout: 60000 });
  
  // Wait a bit to ensure fonts and images load completely, and scroll down to trigger lazy loads if any
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(5000);
  
  const outputPath = path.join(__dirname, '../public/Shivani Vatika/shivani-vatika-11th-brochure.pdf');
  
  console.log(`Generating PDF to ${outputPath}...`);
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  
  console.log('PDF generated successfully!');
  await browser.close();
}

generatePDF().catch(console.error);
