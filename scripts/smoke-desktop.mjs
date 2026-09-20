import { _electron as electron, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const exe = process.env.DESKTOP_EXECUTABLE;
const desktopEnv = { ...process.env };
delete desktopEnv.ELECTRON_RUN_AS_NODE;
const electronApp = await electron.launch({
  ...(exe ? { executablePath: path.resolve(exe), args: [] } : { args: ['.'] }),
  env: desktopEnv,
});
try {
  const page = await electronApp.firstWindow(),
    errors = [],
    remote = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) remote.push(r.url());
  });
  await page.context().setOffline(true);
  await page.reload();
  await mkdir('test-results', { recursive: true });
  const performance = [];
  await expect(page.locator('.exhibit-card')).toHaveCount(6);
  for (const id of ['soda', 'soap', 'fire', 'ice', 'medicine', 'food']) {
    await page.locator(`.exhibit-card[href="#${id}"]`).click();
    await expect(page.locator('#exhibit-canvas')).toBeVisible();
    if (id === 'soda') {
      await page.getByRole('button', { name: 'Open the bottle' }).click();
      await expect(page.locator('#scene-status')).toHaveText('PRESSURE RELEASED');
    } else if (id === 'soap') {
      await page.getByRole('button', { name: 'Add soap' }).click();
      await expect(page.locator('#scene-status')).toHaveText('MICELLE FORMED');
    } else if (id === 'fire') {
      await page.getByRole('switch', { name: 'Oxygen', exact: true }).click();
      await expect(page.locator('#scene-status')).toHaveText('EXTINGUISHED');
      await page.getByRole('switch', { name: 'Oxygen', exact: true }).click();
    } else if (id === 'ice') {
      await page.getByRole('slider').fill('115');
      await expect(page.locator('#phase-badge')).toHaveText('gas');
    } else if (id === 'medicine') {
      await page.getByRole('button', { name: /Oxygen/ }).click();
      await expect(page.locator('#observation')).toContainText('4 oxygen atoms');
      await page.getByRole('button', { name: 'See a target interaction' }).click();
      await expect(page.locator('#scene-status')).toHaveText('MOLECULAR RECOGNITION');
    } else {
      await page.getByRole('button', { name: 'Pure water', exact: true }).click();
      await expect(page.locator('#ph-value')).toHaveText('pH ≈ 7');
      await page.getByRole('button', { name: 'Combine acid + baking soda' }).click();
      await expect(page.locator('#scene-status')).toHaveText('CO₂ IS FORMING');
    }
    const intervals = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const frames = [];
          let previous;
          function sample(time) {
            if (previous) frames.push(time - previous);
            previous = time;
            if (frames.length === 40) resolve(frames.sort((a, b) => a - b));
            else requestAnimationFrame(sample);
          }
          requestAnimationFrame(sample);
        }),
    );
    performance.push({
      exhibit: id,
      medianFrameMs: +intervals[20].toFixed(1),
      p95FrameMs: +intervals[38].toFixed(1),
    });
    await page.getByRole('link', { name: 'Back to museum', exact: true }).click();
  }
  const context = await electronApp.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences(),
  );
  expect(context.nodeIntegration).toBe(false);
  expect(context.contextIsolation).toBe(true);
  expect(context.sandbox).toBe(true);
  expect(errors).toEqual([]);
  expect(remote).toEqual([]);
  await page.screenshot({
    path: 'test-results/desktop-offline.png',
    fullPage: true,
    animations: 'disabled',
  });
  await writeFile('test-results/desktop-performance.json', JSON.stringify(performance, null, 2));
  console.log(
    'Desktop smoke passed: all six exhibits loaded offline, no remote requests, sandbox enabled.',
  );
  console.log(JSON.stringify(performance));
} finally {
  await electronApp.close();
}
