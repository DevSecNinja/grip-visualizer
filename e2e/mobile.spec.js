import { test, expect } from '@playwright/test';

// Mobile / responsive checks. These only run on the emulated mobile device
// projects (Pixel 5, iPhone 12); they are skipped on desktop browsers.
test.describe('mobile / responsive', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only assertions');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the header and view tabs on a small screen', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'GRIP Visualizer' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Matrix' })).toBeVisible();

    const viewport = page.viewportSize();
    expect(viewport && viewport.width).toBeLessThanOrEqual(500);
  });

  test('exposes tappable footer filters on a small screen', async ({ page }) => {
    const orgFilter = page.getByRole('button', { name: 'Organisatorisch' });
    await expect(orgFilter).toBeVisible();
    await orgFilter.tap();
    await expect(orgFilter).toHaveAttribute('aria-pressed', 'true');
  });

  test('can tap a measure and open the detail panel', async ({ page }) => {
    await page.getByRole('button', { name: /O7/ }).first().tap();

    const panel = page.locator('aside.detail');
    await expect(
      panel.getByRole('heading', { name: 'Microsoft-koppeling' })
    ).toBeVisible();

    // The close control is a usable tap target.
    const close = panel.getByRole('button', { name: 'Sluiten' });
    await expect(close).toBeVisible();
    await close.tap();
  });

  test('can switch language on mobile', async ({ page }) => {
    await page.getByRole('button', { name: 'EN', exact: true }).tap();
    await expect(page.getByRole('tab', { name: 'Journey' })).toBeVisible();
  });
});
