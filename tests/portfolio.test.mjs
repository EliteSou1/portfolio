import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const url = process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:3102';
let server;
let browser;
before(async () => {
  if (!process.env.PORTFOLIO_TEST_URL) {
    server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3102'], { stdio: 'pipe' });
    let logs = '';
    server.stderr.on('data', data => { logs += data; });
    let ready = false;
    for (let attempt = 0; attempt < 150; attempt++) {
      try { ready = (await fetch(url)).ok; } catch { /* Server is starting. */ }
      if (ready) break;
      if (server.exitCode !== null) throw new Error(logs);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, `Production server did not start: ${logs}`);
  }
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: ['--no-sandbox'] });
});
after(async () => { await browser?.close(); server?.kill(); });

async function withPage(options, run) {
  const context = await browser.newContext({ locale: 'es-MX', reducedMotion: 'reduce', viewport: { width: 1440, height: 900 }, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await run(page, errors);
  } finally { await context.close(); }
}
async function open(page) {
  await page.goto(url);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
}
async function projects(page) {
  await page.locator('nav button').nth(3).click();
  await page.locator('#section-projects').waitFor();
}

test('Keyboard opens case studies, traps focus, closes and restores the trigger', async () => {
  await withPage({}, async (page, errors) => {
    await open(page);
    await projects(page);
    const card = page.locator('#section-projects [role="button"]').first();
    await card.focus();
    await page.keyboard.press('Space');
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert.equal(await page.locator('#portfolio-shell').evaluate(el => el.inert), true);
    assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true);
    await page.keyboard.press('Tab');
    assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await card.evaluate(el => el === document.activeElement), true);
    assert.equal(await page.locator('#portfolio-shell').evaluate(el => el.inert), false);
    assert.deepEqual(errors, []);
  });
});

test('Wheel scrolls project content and does not turn its momentum into a section jump', async () => {
  await withPage({}, async page => {
    await open(page); await projects(page);
    const list = page.locator('#section-projects .overflow-y-auto');
    await list.evaluate(el => { el.style.scrollSnapType = 'none'; el.scrollTop = 0; });
    await list.hover();
    await page.mouse.wheel(0, 180);
    await page.waitForFunction(() => document.querySelector('#section-projects .overflow-y-auto')?.scrollTop > 0);
    await list.evaluate(el => {
      el.scrollTop = el.scrollHeight;
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true }));
    });
    assert.equal(await page.locator('#section-projects').count(), 1);
    await page.waitForTimeout(250);
    await list.evaluate(el => el.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true })));
    await page.locator('#section-experience').waitFor();
  });
});

test('A touch that finishes native scrolling at the boundary stays in the current section', async () => {
  await withPage({ hasTouch: true }, async page => {
    await open(page); await projects(page);
    await page.locator('#section-projects .overflow-y-auto').evaluate(el => {
      el.style.scrollSnapType = 'none';
      el.scrollTop = 0;
      const target = el;
      const makeTouch = y => new Touch({ identifier: 1, target, clientX: 150, clientY: y });
      target.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [makeTouch(400)] }));
      el.scrollTop = el.scrollHeight;
      target.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [makeTouch(200)] }));
    });
    assert.equal(await page.locator('#section-projects').count(), 1);
  });
});

test('Browser zoom and horizontal wheel gestures do not navigate sections', async () => {
  await withPage({}, async page => {
    await open(page);
    const allowed = await page.locator('main').evaluate(el => [
      new WheelEvent('wheel', { deltaY: 120, ctrlKey: true, bubbles: true, cancelable: true }),
      new WheelEvent('wheel', { deltaX: 120, bubbles: true, cancelable: true }),
    ].map(event => el.dispatchEvent(event)));
    assert.deepEqual(allowed, [true, true]);
    assert.equal(await page.locator('#section-home').count(), 1);
  });
});

test('Space on a focused language button activates it without advancing the section', async () => {
  await withPage({}, async page => {
    await open(page);
    await page.getByRole('button', { name: 'English', exact: true }).focus();
    await page.keyboard.press('Space');
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    assert.equal(await page.locator('#section-home').count(), 1);
  });
});

test('Blocked storage preserves language switching, document language and navigation', async () => {
  await withPage({}, async (page, errors) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
    });
    await open(page);
    await page.getByRole('button', { name: 'English', exact: true }).click();
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.locator('#section-about').waitFor();
    assert.deepEqual(errors, []);
  });
});

test('Mobile exposes controls and all eight sections fit without horizontal page overflow', async () => {
  await withPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, async (page, errors) => {
    await open(page);
    for (const section of ['home', 'about', 'skills', 'projects', 'experience', 'education', 'certifications', 'contact']) {
      await page.locator(`#section-${section}`).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Siguiente', exact: true }).isVisible(), true);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const headerButtons = await page.locator('header button').evaluateAll(buttons => buttons.map(el => {
        const { left, right } = el.getBoundingClientRect(); return left >= 0 && right <= innerWidth;
      }));
      assert.ok(headerButtons.every(Boolean));
      await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
    }
    await page.locator('#section-home').waitFor();
    assert.deepEqual(errors, []);
  });
});

test('Clipboard denial shows recovery feedback and the GitHub link uses EliteSou1', async () => {
  await withPage({}, async (page, errors) => {
    await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Denied')) } }));
    await open(page);
    await page.locator('nav button').nth(7).click();
    await page.locator('#section-contact').waitFor();
    await page.getByRole('button', { name: 'Clic para copiar', exact: true }).click();
    await page.getByText('No se pudo copiar.', { exact: false }).waitFor();
    assert.equal(await page.locator('a[href="https://github.com/EliteSou1"]').count(), 1);
    assert.deepEqual(errors, []);
  });
});

test('Reduced motion keeps a static background without mounting a WebGL canvas', async () => {
  await withPage({}, async page => {
    await open(page);
    await page.locator('.cosmic-backdrop').waitFor();
    assert.equal(await page.locator('canvas').count(), 0);
    await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
    await page.locator('#section-about').waitFor();
    assert.equal(await page.locator('[role="region"]').evaluate(el => getComputedStyle(el).opacity), '1');
  });
});

test('Unavailable WebGL keeps the portfolio readable and navigable', async () => {
  await withPage({ reducedMotion: 'no-preference' }, async page => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        return /webgl/.test(type) ? null : original.call(this, type, ...args);
      };
    });
    await open(page);
    await page.locator('.cosmic-backdrop').waitFor();
    await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
    await page.locator('#section-about').waitFor();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[role="region"]')).opacity === '1');
    assert.equal(await page.locator('header').isVisible(), true);
  });
});

test('Audio activation denial keeps the audio toggle muted without an unhandled rejection', async () => {
  await withPage({}, async (page, errors) => {
    await page.addInitScript(() => {
      const NativeAudioContext = window.AudioContext;
      window.AudioContext = class extends NativeAudioContext {
        get state() { return 'suspended'; }
        resume() { return Promise.reject(new DOMException('Denied', 'NotAllowedError')); }
      };
    });
    await open(page);
    // Locate by its state rather than language-specific descriptive text.
    const toggle = page.locator('header button').last();
    await toggle.click();
    await page.waitForTimeout(100);
    assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
    assert.deepEqual(errors, []);
  });
});
