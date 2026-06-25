const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  console.log('Clicking login button...');
  await page.click('button[data-testid="nav-login"]');
  await page.waitForTimeout(1000);
  
  const dialogVisible = await page.isVisible('div[role="dialog"]');
  console.log('Dialog visible?', dialogVisible);
  
  await browser.close();
})();
