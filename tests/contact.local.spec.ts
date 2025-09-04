import { test, expect } from '@playwright/test';

// Local E2E test for the contact form hitting the Express /api/contact endpoint (Resend)
// Requires the local server to be running at http://localhost:3001 and
// server/.env to have RESEND_API_KEY and RECIPIENT_EMAIL set.

const BASE_URL = 'http://localhost:3001';

test('Contact form submits successfully locally (Resend)', async ({ page }) => {
  // Open the local site directly on the contact section
  await page.goto(`${BASE_URL}/#contact`, { waitUntil: 'domcontentloaded' });

  // Dismiss cookie banner if present
  const acceptButton = page.locator('#accept-cookies');
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
  }

  // Ensure the contact form exists
  const form = page.locator('#contact-form');
  await expect(form).toBeVisible({ timeout: 15000 });

  // Scroll the form into view (helps on smaller screens)
  await form.scrollIntoViewIfNeeded();

  // Fill out form fields
  await page.locator('#name').fill('Playwright Local Test');
  await page.locator('#email').fill('playwright-local-test@example.com');
  await page.locator('#subject').selectOption('other');
  await page.locator('#message').fill(
    `Automated local test via Playwright at ${new Date().toISOString()}. Please ignore.`
  );

  // Capture any alert dialog produced by the page (success/error)
  let dialogText: string | null = null;
  page.once('dialog', async (dialog) => {
    dialogText = dialog.message();
    await dialog.dismiss().catch(() => {});
  });

  // Also wait for the backend call to /api/contact
  const waitForContactApi = page
    .waitForResponse(
      (res) => res.url().includes('/api/contact') && res.request().method() === 'POST',
      { timeout: 30000 }
    )
    .catch(() => null);

  // Submit the form
  await page.locator('#contact-form .submit-button').click();

  // Await the network response (if any)
  const contactResp = await waitForContactApi;
  const contactOk = contactResp ? contactResp.ok() : false;

  // Heuristics for success: either an alert appeared with success message or the API call returned OK
  const dialogLooksSuccessful = dialogText?.toLowerCase().includes('danke') ?? false;

  if (!dialogLooksSuccessful && !contactOk) {
    throw new Error(
      `No success indication detected. dialog='${dialogText ?? 'none'}', apiOk=${contactOk}`
    );
  }

  test.info().annotations.push({
    type: 'info',
    description: `Dialog: ${dialogText ?? 'none'}, Contact API OK: ${contactOk}`,
  });
});
