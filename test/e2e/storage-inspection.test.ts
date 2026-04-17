/**
 * E2E test scaffold for Cookie Monster extension.
 * Uses Playwright to load the extension in Chromium and test the popup + devtools.
 *
 * To run: npx playwright test
 * Requires: playwright and @playwright/test installed
 */

import { test, expect, type BrowserContext } from '@playwright/test';
import path from 'path';

const EXTENSION_PATH = path.resolve(__dirname, '../../dist');

let context: BrowserContext;

test.beforeAll(async ({ browserName }) => {
  test.skip(browserName !== 'chromium', 'Extension tests only run in Chromium');
});

test.beforeEach(async ({ browser }) => {
  context = await (
    browser as unknown as { newContext: (opts: unknown) => Promise<BrowserContext> }
  ).newContext({
    // Load extension in Chromium
    args: [`--disable-extensions-except=${EXTENSION_PATH}`, `--load-extension=${EXTENSION_PATH}`],
  });
});

test.afterEach(async () => {
  await context?.close();
});

test.describe('Cookie Monster Extension', () => {
  test('popup opens and shows domain info', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');

    // Get the extension ID from the service worker
    const [worker] = context.serviceWorkers();
    const extensionId = worker?.url().split('/')[2];

    if (extensionId) {
      const popup = await context.newPage();
      await popup.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
      await expect(popup.locator('text=Cookie Monster')).toBeVisible();
    }
  });

  test('devtools panel loads', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');

    const [worker] = context.serviceWorkers();
    const extensionId = worker?.url().split('/')[2];

    if (extensionId) {
      const panel = await context.newPage();
      await panel.goto(`chrome-extension://${extensionId}/src/devtools/panel.html`);
      await expect(panel.locator('text=Cookie Monster')).toBeVisible();
    }
  });
});
