const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'before-click.png' });
  
  console.log('Clicking login...');
  await page.click('button[data-testid="nav-login"]');
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'after-click.png' });
  
  const dialogVisible = await page.isVisible('div[role="dialog"]');
  console.log('Dialog visible?', dialogVisible);

  await browser.close();
})();
