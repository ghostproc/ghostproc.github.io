// Regenerates assets/johan-klenner-resume.pdf from index.html. Run after editing resume content:
//   npm install to install playwright
//   npm run generate-pdf
// Renders the page headlessly at desktop width and saves a single continuous PDF page matching the on-screen two-column layout

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(root, 'assets', 'johan-klenner-resume.pdf');

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto('file://' + path.join(root, 'index.html'), { waitUntil: 'networkidle' });
// let icons settle and IntersectionObserver animations resolve
await page.waitForTimeout(1000);

const { width, height } = await page.evaluate(() => {
  const rect = document.querySelector('.page-wrapper').getBoundingClientRect();
  const body = getComputedStyle(document.body);
  return {
    width: rect.width + parseFloat(body.paddingLeft) + parseFloat(body.paddingRight),
    height: rect.height + parseFloat(body.paddingTop) + parseFloat(body.paddingBottom),
  };
});

await page.addStyleTag({ content: `@page { size: ${width / 96}in ${height / 96}in; margin: 0; }` });

await page.pdf({ path: outPath, preferCSSPageSize: true, printBackground: true });
await browser.close();

console.log(`Wrote ${outPath} (${(width / 96).toFixed(2)}in x ${(height / 96).toFixed(2)}in)`);
