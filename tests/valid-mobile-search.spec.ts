// spec: specs/flipkart-search-functionality.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Basic Search Functionality', () => {
  test('Valid Product Search - Mobile Category', async ({ page }) => {
    // 1. Navigate to Flipkart homepage
    await page.goto('https://www.flipkart.com');
    
    // Wait for page to be ready 
    await page.waitForLoadState('networkidle');
    
    // Handle potential login popup or overlay by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // Try to close any modal that might be open
    const closeButtons = page.locator('button:has-text("✕")').or(page.locator('[aria-label*="close"]')).or(page.locator('.close-button'));
    if (await closeButtons.first().isVisible()) {
      await closeButtons.first().click();
    }
    
    // 2. Find and interact with search box using multiple strategies
    const searchBox = page.getByRole('textbox', { name: /Search for Products/ });
    await expect(searchBox).toBeVisible();
    
    // Use force: true to bypass overlay issues
    await searchBox.click({ force: true });
    await searchBox.fill('iphone 15');
    
    // Verify the search box has the right value
    await expect(searchBox).toHaveValue('iphone 15');
    
    // 3. Submit search using Enter key (more reliable than button click)
    await searchBox.press('Enter');
    
    // Wait for navigation to search results
    await page.waitForURL(/.*search.*q.*iphone.*15.*/i, { timeout: 15000 });
    
    // 4. Verify search results page
    await expect(page).toHaveTitle(/.*iphone.*15.*/i);
    
    // Verify search results are displayed with flexible text matching
    await expect(
      page.locator('text="results for"').or(
        page.locator(':text("results")')
      ).or(
        page.getByText(/results/i)
      ).first()
    ).toBeVisible({ timeout: 10000 });
    
    // Verify product listings are present 
    await expect(page.locator('a[href*="/p/"]').first()).toBeVisible({ timeout: 10000 });
    
    // Verify breadcrumb or navigation is present
    await expect(
      page.getByRole('link', { name: 'Home' }).or(
        page.locator('nav')
      ).or(
        page.locator('[aria-label*="breadcrumb"]')
      ).first()
    ).toBeVisible();
    
    // Verify search box retains the search term
    const resultPageSearchBox = page.getByRole('textbox', { name: /Search/ });
    await expect(resultPageSearchBox).toHaveValue('iphone 15');
  });
});