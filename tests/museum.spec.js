import { test, expect } from '@playwright/test';

test('the museum has six entrances and complete previous / next / home navigation', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('The Chemistry');
  await expect(page.locator('.exhibit-card')).toHaveCount(6);
  await page.screenshot({
    path: 'test-results/museum-home.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('link', { name: 'Explore the museum', exact: true }).click();
  for (const name of ['Soda', 'Soap', 'Fire', 'Ice', 'Medicine', 'Food']) {
    await expect(page).toHaveTitle(new RegExp(`^${name}`));
    await page.locator('.next').click();
  }
  await expect(page).toHaveTitle(/^Soda/);
  await page.locator('.previous').click();
  await expect(page).toHaveTitle(/^Food/);
  await page.getByRole('link', { name: 'All exhibits', exact: true }).click();
  await expect(page.locator('.exhibit-card')).toHaveCount(6);
  expect(errors).toEqual([]);
});
test('opening soda drops pressure, depletes CO2 and reset seals a fresh bottle', async ({
  page,
}) => {
  await page.goto('/#soda');
  await expect(page.locator('#scene-status')).toHaveText('BOTTLE SEALED');
  await page.getByRole('button', { name: 'Open the bottle' }).click();
  await expect(page.locator('#scene-status')).toHaveText('PRESSURE RELEASED');
  await expect(page.locator('#observation')).toContainText('pressure has dropped');
  await expect
    .poll(async () => parseFloat(await page.locator('#co2-meter').evaluate((el) => el.style.width)))
    .toBeLessThan(95);
  await page.screenshot({ path: 'test-results/soda-open.png', fullPage: true });
  await page.getByRole('button', { name: 'Reset exhibit' }).click();
  await expect(page.getByRole('button', { name: 'Open the bottle' })).toBeEnabled();
  await expect(page.locator('#co2-value')).toHaveText('High');
});
test('soap forms a correctly oriented micelle', async ({ page }) => {
  await page.goto('/#soap');
  await page.getByRole('button', { name: 'Add soap' }).click();
  await expect(page.locator('#scene-status')).toHaveText('MICELLE FORMED');
  await expect(page.locator('#observation')).toContainText('tails point inward');
  await page.screenshot({ path: 'test-results/soap-micelle.png', fullPage: true });
});
test('each of fuel, oxygen and heat extinguishes and restores fire', async ({ page }) => {
  await page.goto('/#fire');
  for (const name of ['Fuel', 'Oxygen', 'Heat']) {
    const toggle = page.getByRole('switch', { name, exact: true });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(page.locator('#scene-status')).toHaveText('EXTINGUISHED');
    await toggle.click();
    await expect(page.locator('#scene-status')).toHaveText('BURNING');
  }
  await page.screenshot({ path: 'test-results/fire-burning.png', fullPage: true });
});
test('temperature slider changes molecular phase, including both thresholds', async ({ page }) => {
  await page.goto('/#ice');
  const slider = page.getByRole('slider');
  for (const [temp, phase] of [
    [-30, 'solid'],
    [0, 'melting / freezing'],
    [25, 'liquid'],
    [100, 'boiling / condensing'],
    [120, 'gas'],
  ]) {
    await slider.fill(String(temp));
    await expect(page.locator('#phase-badge')).toHaveText(phase);
  }
  await page.getByRole('button', { name: 'Solid', exact: true }).click();
  await expect(slider).toHaveValue('-15');
  // Allow the visible molecular transition back from gas to settle before visual QA.
  await page.waitForTimeout(1600);
  await page.screenshot({ path: 'test-results/ice-solid.png', fullPage: true });
  await page.getByRole('button', { name: 'Liquid', exact: true }).click();
  await expect(slider).toHaveValue('25');
});
test('aspirin elements can be inspected, rotated and shown interacting with a target', async ({
  page,
}) => {
  await page.goto('/#medicine');
  for (const name of ['Carbon', 'Hydrogen', 'Oxygen']) {
    const button = page.getByRole('button', { name: new RegExp(name) });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#observation')).toContainText(name.toLowerCase());
  }
  const canvas = page.locator('#exhibit-canvas');
  await canvas.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowUp');
  await page.screenshot({ path: 'test-results/medicine-atoms.png', fullPage: true });
  await page.getByRole('button', { name: 'See a target interaction' }).click();
  await expect(page.locator('#scene-status')).toHaveText('MOLECULAR RECOGNITION');
  await page.screenshot({ path: 'test-results/medicine-target.png', fullPage: true });
  await page.getByRole('button', { name: 'Back to molecule' }).click();
  await expect(page.locator('#scene-status')).toHaveText('ASPIRIN · 21 ATOMS');
});
test('food pH examples and finite bicarbonate reaction work', async ({ page }) => {
  await page.goto('/#food');
  for (const [name, ph] of [
    ['Pure water', '7'],
    ['Baking soda solution', '8.3'],
    ['Lemon juice', '2.2'],
  ]) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.locator('#ph-value')).toHaveText(`pH ≈ ${ph}`);
  }
  await page.getByRole('button', { name: 'Combine acid + baking soda' }).click();
  await expect(page.locator('#scene-status')).toHaveText('CO₂ IS FORMING');
  await page.screenshot({ path: 'test-results/food-reaction.png', fullPage: true });
  await expect(page.locator('#scene-status')).toHaveText('REACTION COMPLETE', { timeout: 20000 });
  await page.getByRole('button', { name: 'Reset exhibit' }).click();
  await expect(page.getByRole('button', { name: 'Combine acid + baking soda' })).toBeEnabled();
});
test('layout fits laptop and narrow windows; reduced motion preserves interactions', async ({
  page,
}) => {
  for (const width of [1280, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 800 });
    for (const route of ['museum', 'medicine', 'food']) {
      await page.goto(`/#${route}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#fire');
  await page.getByRole('switch', { name: 'Oxygen', exact: true }).click();
  await expect(page.locator('#scene-status')).toHaveText('EXTINGUISHED');
});
