import { test, expect } from '@playwright/test';

// NOTE: This test will send a real test email via EmailJS
// destination configured on the live site. It submits the
// contact form with a clear test message.

test('Contact form sends email via EmailJS', async ({ page }) => {
  // Navigate to the live site
  await page.goto('https://www.rouvenzietz.de', { waitUntil: 'domcontentloaded' });

  // Dismiss cookie banner if present
  const acceptButton = page.locator('#accept-cookies');
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
  }

  // Ensure the contact form exists
  const form = page.locator('#contact-form');
  await expect(form).toBeVisible({ timeout: 15000 });

  // Scroll into view if needed
  await form.scrollIntoViewIfNeeded();

  // Fill fields
  await page.locator('#name').fill('Codex Playwright Test');
  await page.locator('#email').fill('codex-playwright-test@example.com');
  await page.locator('#subject').selectOption('other');
  await page.locator('#message').fill(`Automated test message from Playwright at ${new Date().toISOString()}. Please ignore.`);

  // Prepare to observe either an alert dialog or a success overlay
  let dialogText: string | null = null;
  page.once('dialog', async (dialog) => {
    dialogText = dialog.message();
    await dialog.dismiss().catch(() => {});
  });

  // Also wait for EmailJS network request as a success indicator
  const waitForEmailJs = page.waitForResponse(
    (res) => res.url().includes('emailjs') && res.request().method() === 'POST',
    { timeout: 20000 }
  ).catch(() => null);

  // Submit
  await page.locator('#contact-form .submit-button').click();

  // Wait for either EmailJS POST or dialog/overlay
  const emailResp = await waitForEmailJs;

  // Check for success overlay class if present on this version of the site
  const overlay = page.locator('.message-overlay.success');
  const overlayShown = await overlay.isVisible().catch(() => false);

  // Basic success heuristics
  const emailOk = emailResp ? emailResp.ok() : false;

  if (!dialogText && !overlayShown && !emailOk) {
    // If none of the success indicators fired, consider it a failure
    throw new Error('No success indication detected (no alert, no overlay, no EmailJS POST).');
  }

  // If we reached here, at least one success indicator was observed
  test.info().annotations.push({ type: 'info', description: `Dialog: ${dialogText ?? 'none'}, Overlay: ${overlayShown}, EmailJS OK: ${emailOk}` });
});

