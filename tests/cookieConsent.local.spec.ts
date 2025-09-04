import { test, expect } from '@playwright/test';

// Local E2E tests for cookie consent banner behavior and persistence
// These tests target the static server at http://localhost:3003 by default.
// Start it with: npm run static (in server/) or npm --prefix server run static

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';

const fontsGoogle = 'link[href*="fonts.googleapis.com"]';
const fontsGStatic = 'link[href*="fonts.gstatic.com"]';

// Utility: get cookie string from page
async function getCookieString(page) {
  return page.evaluate(() => document.cookie);
}

// Utility: check fonts present
async function areGoogleFontsPresent(page) {
  const count1 = await page.locator(fontsGoogle).count();
  const count2 = await page.locator(fontsGStatic).count();
  return count1 + count2 > 0;
}

test.describe('Cookie Consent Banner (local)', () => {
  test('Banner appears on first visit and Accept loads Google Fonts', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible({ timeout: 5000 });

    await page.locator('#accept-cookies').click();
    await expect(banner).toBeHidden();

    const consent = await page.evaluate(() => localStorage.getItem('cookieConsent'));
    expect(consent).toBe('accepted');

    // Fonts should be loaded after accepting
    await page.waitForSelector(fontsGoogle, { state: 'attached', timeout: 5000 });
    expect(await areGoogleFontsPresent(page)).toBeTruthy();

    const cookieStr = await getCookieString(page);
    expect(cookieStr).toContain('cookieConsent=accepted');
    expect(cookieStr).toContain('necessaryCookies=true');
  });

  test('Reject hides banner and prevents Google Fonts from loading', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible({ timeout: 5000 });

    await page.locator('#reject-cookies').click();
    await expect(banner).toBeHidden();

    const consent = await page.evaluate(() => localStorage.getItem('cookieConsent'));
    expect(consent).toBe('rejected');

    // Fonts should NOT be loaded after rejecting
    await page.waitForTimeout(300); // allow any stray async font loads to attempt
    expect(await areGoogleFontsPresent(page)).toBeFalsy();

    const cookieStr = await getCookieString(page);
    expect(cookieStr).toContain('cookieConsent=rejected');
    expect(cookieStr).toContain('necessaryCookies=true');
  });

  test('Persistence: Accept choice persists across reload', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible({ timeout: 5000 });

    await page.locator('#accept-cookies').click();
    await expect(banner).toBeHidden();

    await page.reload({ waitUntil: 'domcontentloaded' });

    // Banner should not show again; fonts should remain loaded
    await expect(page.locator('#cookie-banner')).toBeHidden();
    const consent = await page.evaluate(() => localStorage.getItem('cookieConsent'));
    expect(consent).toBe('accepted');
    expect(await areGoogleFontsPresent(page)).toBeTruthy();
  });

  test('Persistence: Reject choice persists across reload', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible({ timeout: 5000 });

    await page.locator('#reject-cookies').click();
    await expect(banner).toBeHidden();

    await page.reload({ waitUntil: 'domcontentloaded' });

    // Banner should not show again; fonts should not be loaded
    await expect(page.locator('#cookie-banner')).toBeHidden();
    const consent = await page.evaluate(() => localStorage.getItem('cookieConsent'));
    expect(consent).toBe('rejected');
    expect(await areGoogleFontsPresent(page)).toBeFalsy();
  });

  test('Banner Datenschutzerklärung link navigates to /datenschutz.html and page shows content', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    // Click the privacy policy link inside the cookie banner
    const link = page.locator('#cookie-banner a[href="/datenschutz.html"]');
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(new RegExp('/datenschutz\.html$'));

    // Check that the Datenschutzerklärung heading exists
    const heading = page.locator('h1', { hasText: 'Datenschutzerklärung' });
    await expect(heading).toBeVisible();

    // Banner should be visible on this page as well on first visit
    await expect(page.locator('#cookie-banner')).toBeVisible({ timeout: 5000 });
  });
});
