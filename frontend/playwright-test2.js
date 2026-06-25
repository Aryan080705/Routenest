const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('request', request => console.log('>>', request.method(), request.url()));
  page.on('response', response => console.log('<<', response.status(), response.url()));
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  console.log('Clicking login button on navbar...');
  await page.click('button[data-testid="nav-login"]');
  await page.waitForTimeout(1000);
  
  const dialogVisible = await page.isVisible('div[role="dialog"]');
  console.log('Dialog visible?', dialogVisible);

  if (dialogVisible) {
      console.log('Typing credentials...');
      await page.fill('input[type="email"]', 'test@test.com');
      await page.fill('input[type="password"]', 'testtest');
      
      console.log('Submitting login form...');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
  }
  
  await browser.close();
})();
