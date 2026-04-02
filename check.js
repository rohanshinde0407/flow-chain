const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.toString()));
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  const html = await page.content();
  console.log('BODY:', html.substring(0, 1500));
  await browser.close();
})();
