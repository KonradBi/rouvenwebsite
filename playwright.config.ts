import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  testDir: 'tests',
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', headless: true },
    },
  ],
});

