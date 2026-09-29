import { test, expect } from '@playwright/test';

test.describe('Floating Contact and BackToTop positioning', () => {
  test.describe.configure({ timeout: 60000 });

  test('desktop: BackToTop and Floating Badges do not overlap when scrolled', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop floating badges only exist on md+ screens');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const floatingBadges = page.locator('.fixed.right-8.bottom-8');
    await expect(floatingBadges).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(600);

    const b2t = page.getByRole('button', { name: /Back to top|वापस ऊपर जाएं/i });
    await expect(b2t).toBeVisible();

    const b2tBox = await b2t.boundingBox();
    const badgesBox = await floatingBadges.boundingBox();

    expect(b2tBox).not.toBeNull();
    expect(badgesBox).not.toBeNull();

    // BackToTop bottom must be higher up on the screen (smaller y) than the top of floatingBadges
    expect(b2tBox!.y + b2tBox!.height).toBeLessThanOrEqual(badgesBox!.y);
  });

  test('mobile: BackToTop sits above mobile bottom dock without overlapping', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Mobile dock check only applies to mobile viewports');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const bottomDock = page.locator('.fixed.right-0.bottom-0.left-0').first();
    await expect(bottomDock).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(600);

    const b2t = page.getByRole('button', { name: /Back to top|वापस ऊपर जाएं/i });
    await expect(b2t).toBeVisible();

    const b2tBox = await b2t.boundingBox();
    const dockBox = await bottomDock.boundingBox();

    expect(b2tBox).not.toBeNull();
    expect(dockBox).not.toBeNull();

    expect(b2tBox!.y + b2tBox!.height).toBeLessThanOrEqual(dockBox!.y);
  });
});
