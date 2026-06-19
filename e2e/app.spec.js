import { test, expect } from '@playwright/test';

// Core end-to-end flows, exercised across every configured browser/device
// project (desktop Chromium/Firefox/WebKit + mobile Chrome/Safari).

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('loads with a meaningful title and the matrix view', async ({ page }) => {
  await expect(page).toHaveTitle(/GRIP Visualizer/);
  await expect(page.getByRole('region', { name: 'Matrix' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'GRIP Visualizer' })).toBeVisible();
});

test('switches between the four views', async ({ page }) => {
  await page.getByRole('tab', { name: 'Groeitraject' }).click();
  await expect(page.getByRole('region', { name: 'Groeitraject' })).toBeVisible();

  await page.getByRole('tab', { name: 'A3 vs A5' }).click();
  await expect(page.getByRole('tab', { name: 'A3 vs A5' })).toHaveAttribute(
    'aria-selected',
    'true'
  );

  await page.getByRole('tab', { name: 'Prioriteren' }).click();
  await expect(page.getByRole('tab', { name: 'Prioriteren' })).toHaveAttribute(
    'aria-selected',
    'true'
  );

  await page.getByRole('tab', { name: 'Matrix' }).click();
  await expect(page.getByRole('region', { name: 'Matrix' })).toBeVisible();
});

test('switches the UI language NL → EN → FR', async ({ page }) => {
  await expect(page.getByRole('tab', { name: 'Groeitraject' })).toBeVisible();

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Journey' })).toBeVisible();

  await page.getByRole('button', { name: 'FR', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Parcours' })).toBeVisible();

  await page.getByRole('button', { name: 'NL', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Groeitraject' })).toBeVisible();
});

test('applies the footer type and tier filters', async ({ page }) => {
  const orgFilter = page.getByRole('button', { name: 'Organisatorisch' });
  await orgFilter.click();
  await expect(orgFilter).toHaveAttribute('aria-pressed', 'true');

  const tierFilter = page.getByRole('button', { name: 'A5', exact: true });
  await tierFilter.click();
  await expect(tierFilter).toHaveAttribute('aria-pressed', 'true');

  // Clearing the filters resets the pressed state.
  await page.getByRole('button', { name: /Wissen/ }).click();
  await expect(orgFilter).toHaveAttribute('aria-pressed', 'false');
});

test('opens the detail panel with the Microsoft mapping and references', async ({
  page,
}) => {
  await page.getByRole('button', { name: /O7/ }).first().click();

  const panel = page.locator('aside.detail');
  await expect(panel.getByRole('heading', { name: 'Microsoft-koppeling' })).toBeVisible();
  await expect(
    panel.getByText('Microsoft Entra Conditional Access', { exact: true })
  ).toBeVisible();

  // References / further-reading section (issue #63).
  await expect(panel.getByRole('heading', { name: 'Meer lezen' })).toBeVisible();
  const reference = panel.getByRole('link', { name: /leerlingen/ });
  await expect(reference).toHaveAttribute('target', '_blank');
  await expect(reference).toHaveAttribute(
    'href',
    /learn\.microsoft\.com.*protect-passwordless-students/
  );
});

test('external documentation links open safely in a new tab', async ({ page }) => {
  await page.getByRole('button', { name: /O7/ }).first().click();

  const docsLink = page
    .locator('aside.detail')
    .getByRole('link', { name: /Documentatie openen/ })
    .first();
  await expect(docsLink).toHaveAttribute('target', '_blank');
  await expect(docsLink).toHaveAttribute('rel', /noopener/);
});

test('exposes the M365 Maps reference link in the footer', async ({ page }) => {
  const mapsLink = page.getByRole('link', { name: /M365 Maps/ });
  await expect(mapsLink).toHaveAttribute('href', 'https://m365maps.com/');
  await expect(mapsLink).toHaveAttribute('target', '_blank');
});
