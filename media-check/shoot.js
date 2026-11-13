// Screenshot every slides/html/slide-NN.html to slides/slide-NN.png at 1920x1080, deviceScaleFactor 2.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dir = path.join(__dirname, 'slides', 'html');
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 })).newPage();
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort()) {
    await page.goto('file://' + path.join(dir, f));
    await page.evaluate(() => document.fonts.ready);
    // report anything that spills out of the 1920x1080 frame
    const over = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => {
      const r = e.getBoundingClientRect(); return r.width && (r.right > 1921 || r.bottom > 1081);
    }).map(e => e.className || e.tagName).slice(0, 5));
    if (over.length) console.log('OVERFLOW', f, over);
    await page.screenshot({ path: path.join(__dirname, 'slides', f.replace('.html', '.png')) });
    console.log('shot', f);
  }
  await browser.close();
})();
