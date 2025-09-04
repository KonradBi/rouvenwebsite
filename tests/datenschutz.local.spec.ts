import { test, expect } from '@playwright/test';

// Local E2E tests for Datenschutzerklärung page content and consent flow
// Target the static server at http://localhost:3003

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';
const DSGVO_URL = `${BASE_URL}/datenschutz.html`;

const fontsGoogle = 'link[href*="fonts.googleapis.com"]';
const fontsGStatic = 'link[href*="fonts.gstatic.com"]';

async function areGoogleFontsPresent(page) {
  const count1 = await page.locator(fontsGoogle).count();
  const count2 = await page.locator(fontsGStatic).count();
  return count1 + count2 > 0;
}

async function getCookieString(page) {
  return page.evaluate(() => document.cookie);
}

test.describe('Datenschutzerklärung page (local)', () => {
  test('Content is visible and banner shows on first visit', async ({ page }) => {
    await page.goto(DSGVO_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('h1', { hasText: 'Datenschutzerklärung' })).toBeVisible();
    await expect(page.locator('#cookie-banner')).toBeVisible({ timeout: 5000 });

    // Some sections should be present
    await expect(page.locator('h2', { hasText: '§ 3 Cookies' })).toBeVisible();
    await expect(page.locator('h2', { hasText: '§ 7 Kontaktaufnahme' })).toBeVisible();
  });

  test('Accept consent loads Google Fonts and persists across reload', async ({ page }) => {
    await page.goto(DSGVO_URL, { waitUntil: 'domcontentloaded' });

    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible();
    await page.locator('#accept-cookies').click();
    await expect(banner).toBeHidden();

    // Fonts should be loaded
    await page.waitForSelector(fontsGoogle, { state: 'attached', timeout: 5000 });
    expect(await areGoogleFontsPresent(page)).toBeTruthy();

    // Cookies/localStorage set
    const cookieStr = await getCookieString(page);
    expect(cookieStr).toContain('cookieConsent=accepted');
    expect(cookieStr).toContain('necessaryCookies=true');
    const consent = await page.evaluate(() => localStorage.getItem('cookieConsent'));
    expect(consent).toBe('accepted');

    // Reload: banner should stay hidden, fonts remain
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#cookie-banner')).toBeHidden();
    expect(await areGoogleFontsPresent(page)).toBeTruthy();
  });

  test('Reject consent keeps fonts removed and persists, then navigate back to home', async ({ page }) => {
    await page.goto(DSGVO_URL, { waitUntil: 'domcontentloaded' });

    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible();
    await page.locator('#reject-cookies').click();
    await expect(banner).toBeHidden();

    // Fonts should not be present
    await page.waitForTimeout(300);
    expect(await areGoogleFontsPresent(page)).toBeFalsy();

    // Persistence after reload
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#cookie-banner')).toBeHidden();
    expect(await areGoogleFontsPresent(page)).toBeFalsy();

    // Back to home link should navigate to "/" and consent persists
    const backLink = page.locator('a.back-to-home');
    await expect(backLink.first()).toBeVisible();
    await backLink.first().click();
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/?$`));

    // Banner stays hidden on home and fonts remain absent
    await expect(page.locator('#cookie-banner')).toBeHidden();
    expect(await areGoogleFontsPresent(page)).toBeFalsy();
  });
});
