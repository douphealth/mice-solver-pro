import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
});
for (const width of [390, 1280]) {
  test(`planner and PDF work at ${width}px without overflow or diagnosis`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Personalized Mouse Control Planner' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await page.goto('/quiz');
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
    await page.getByLabel('Noises only or with other signs', { exact: true }).check(); await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByLabel('Kitchen', { exact: true }).check(); await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByLabel('Apartment / condo', { exact: true }).check(); await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByLabel('Children', { exact: true }).check(); await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByLabel('Nothing yet', { exact: true }).check(); await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click(); await expect(page.getByLabel('Nothing yet', { exact: true })).toBeChecked(); await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByLabel('Some bags or cardboard packages', { exact: true }).check(); await page.getByRole('button', { name: 'View my plan', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your Mouse Control Plan', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Activity not confirmed by physical evidence', exact: true })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    expect(await page.locator('body').innerText()).not.toMatch(/12,847|94%|[1-9]\/10|estimated population/i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    mkdirSync('evidence/browser', { recursive: true });
    await page.screenshot({ path: `evidence/browser/report-${width}.png`, fullPage: true });
    const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download free plan PDF' }).click();
    const download = await downloadPromise; expect(download.suggestedFilename()).toBe('MiceGoneGuide-Mouse-Control-Plan.pdf');
    await download.saveAs(`evidence/browser/plan-${width}.pdf`);
  });
}
test('action planner distinguishes an electrical hazard and preserves route canonicals', async ({ page }) => {
  await page.goto('/tools/calculator');
  await page.getByLabel('Choose the observation to review').selectOption('damaged_wiring');
  await expect(page.getByText('Reported conditions need qualified attention', { exact: true })).toBeVisible();
  await expect(page.getByText(/qualified electrician/)).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://elimination.micegoneguide.com/tools/calculator');
  await page.goto('/tools/entry-points'); await page.getByLabel('Apartment / condo', { exact: true }).check();
  await page.getByText('Shared-building coordination', { exact: true }).click();
  await expect(page.getByText(/Coordinate shared-wall/)).toBeVisible();
});
