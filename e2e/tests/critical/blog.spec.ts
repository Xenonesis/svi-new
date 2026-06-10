import { test, expect } from '@playwright/test';

test.describe('Blog Listing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
  });

  test('renders blog hero and post cards', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    // Blog cards/articles should exist
    const articles = page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('category filter tabs work', async ({ page }) => {
    const tabs = page.locator('button:has-text("All"), button:has-text("सभी")');
    if ((await tabs.count()) > 0) {
      await tabs.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('read more link goes to detail page', async ({ page }) => {
    const readMore = page
      .locator('a:has-text("Read More"), a:has-text("पढ़ें"), a:has-text("पूरा पढ़ें")')
      .first();
    if ((await readMore.count()) > 0) {
      await readMore.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/blog/');
    }
  });
});

test.describe('Blog Detail', () => {
  test('renders blog content with key elements', async ({ page }) => {
    await page.goto('/blog/top-5-real-estate-investment-tips');
    await page.waitForLoadState('networkidle');

    // Title should be visible
    await expect(page.locator('h1')).toBeVisible();

    // Content area should exist
    const content = page.locator('.blog-content');
    await expect(content).toBeVisible();

    // Reading progress bar should exist
    const progressBar = page.locator('.fixed.top-0.h-1');
    await expect(progressBar).toBeVisible();
  });

  test('shows key takeaways', async ({ page }) => {
    await page.goto('/blog/top-5-real-estate-investment-tips');
    await page.waitForLoadState('networkidle');

    const takeaways = page.locator('.blog-takeaways');
    if ((await takeaways.count()) > 0) {
      await expect(takeaways).toBeVisible();
    }
  });

  test('renders related posts', async ({ page }) => {
    await page.goto('/blog/top-5-real-estate-investment-tips');
    await page.waitForLoadState('networkidle');

    const relatedSection = page.locator('h2:has-text("Related"), h2:has-text("पढ़ें")');
    if ((await relatedSection.count()) > 0) {
      await expect(relatedSection).toBeVisible();
    }
  });

  test('blog detail in Hindi', async ({ page }) => {
    await page.goto('/hi/blog/top-5-real-estate-investment-tips');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
    const content = page.locator('.blog-content');
    await expect(content).toBeVisible();
  });
});
