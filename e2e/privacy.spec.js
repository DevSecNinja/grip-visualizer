import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';

// Privacy guarantee: "All your data stays in your browser."
//
// The visualizer is a fully client-side app — loading, parsing, rendering and
// exporting the user's self-evaluation must never send that data to a server.
// This suite exercises the primary data-handling flows (enter self-evaluation,
// import a local file, render the result, export/download) while recording
// every outbound network request. It fails if anything is sent to a host other
// than the local app origin, providing regression protection for the privacy
// claim. See the disclaimer rendered by App.jsx (i18n key `disclaimerPrivacy`).

const FIXTURE = fileURLToPath(new URL('./fixtures/assessment.json', import.meta.url));

// Request schemes that never reach the network. `blob:`/`data:` back the
// client-side file downloads (URL.createObjectURL), and `about:`/`chrome:` are
// browser-internal navigations.
const LOCAL_SCHEMES = ['data:', 'blob:', 'about:', 'chrome:', 'chrome-extension:'];

// Collect every request whose URL leaves the app's own origin. Same-origin
// requests (app bundle, JSON dataset, Vite HMR socket, local icons) and the
// in-memory blob/data downloads are expected; anything else would mean user
// data could be leaving the browser.
function trackOffOriginRequests(page, appOrigin) {
  const offOrigin = [];
  page.on('request', (request) => {
    const url = request.url();
    if (LOCAL_SCHEMES.some((scheme) => url.startsWith(scheme))) return;
    if (url.startsWith(appOrigin)) return;
    offOrigin.push(`${request.method()} ${url}`);
  });
  return offOrigin;
}

test.describe('privacy: all data stays in the browser', () => {
  test('data-handling flows make no off-origin network requests', async ({
    page,
    baseURL,
  }) => {
    const appOrigin = new URL(baseURL).origin;
    const offOrigin = trackOffOriginRequests(page, appOrigin);

    // 1. Load the app and confirm the primary visualization renders.
    await page.goto('/');
    await expect(page.getByRole('region', { name: 'Matrix' })).toBeVisible();

    // 2. Enter self-evaluation mode (the flow that handles user-entered data).
    // The native checkbox sits behind a styled switch track, so toggle it via
    // the labelled switch control rather than the visually-covered input.
    await page.locator('label.switch').click();
    await expect(page.getByRole('region', { name: 'Voortgangsoverzicht' })).toBeVisible();

    // 3. Enter user data directly: open a measure and record a status + note.
    await page.getByRole('button', { name: /O7/ }).first().click();
    const panel = page.locator('aside.detail');
    await panel.getByRole('button', { name: 'Gedaan', exact: true }).click();
    await panel
      .getByLabel('Notitie')
      .fill('Locally entered note — must never leave the browser.');
    await page.getByRole('button', { name: 'Sluiten' }).click();

    // 4. Import a local self-evaluation file via the file picker and confirm
    //    the parsed data is reflected in the rendered scorecard.
    await page.locator('input[type="file"]').setInputFiles(FIXTURE);
    await expect(page.getByText('Import geslaagd.')).toBeVisible();
    const scorecard = page.getByRole('region', { name: 'Voortgangsoverzicht' });
    await expect(scorecard.getByText(/Gedaan:\s*2\/52/)).toBeVisible();

    // 5. Export the self-evaluation as JSON — a client-side download, no upload.
    const jsonDownload = page.waitForEvent('download');
    await scorecard.getByRole('button', { name: /Exporteren/ }).click();
    expect((await jsonDownload).suggestedFilename()).toMatch(
      /^grip-assessment-.*\.json$/
    );

    // 6. Export a Markdown summary via the header export menu (also client-side).
    await page.getByRole('button', { name: 'Exporteren', exact: true }).click();
    const mdDownload = page.waitForEvent('download');
    await page.getByRole('menuitem', { name: 'Markdown' }).click();
    expect((await mdDownload).suggestedFilename()).toMatch(/\.md$/);

    // 7. Visit the remaining visualizations to exercise their render paths.
    for (const view of ['Groeitraject', 'A3 vs A5', 'Prioriteren']) {
      await page.getByRole('tab', { name: view }).click();
    }

    // Give any deferred/async request a chance to fire before asserting.
    await page.waitForTimeout(500);

    // The core assertion: nothing left the app's own origin during any of the
    // flows above. Failing here means the privacy claim has regressed.
    expect(offOrigin, `Unexpected off-origin requests:\n${offOrigin.join('\n')}`).toEqual(
      []
    );
  });
});
