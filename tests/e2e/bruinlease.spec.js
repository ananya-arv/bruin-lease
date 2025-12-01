// tests/e2e/bruinlease.spec.js

const { test, expect } = require('@playwright/test');


// Test configuration and helpers
const TEST_USER = {
  name: 'Test User E2E',
  email: `testuser${Date.now()}@ucla.edu`,
  password: 'TestPassword123'
};

const SECOND_USER = {
  name: 'Second Test User',
  email: `seconduser${Date.now()}@ucla.edu`,
  password: 'TestPassword456'
};

const TEST_LISTING = {
  title: 'Modern 2BR Apartment Near UCLA Campus',
  description: 'Beautiful apartment with modern amenities, walking distance to campus. Perfect for students!',
  address: '123 Westwood Blvd, Los Angeles, CA 90024',
  zipCode: '90024',
  country: 'USA',
  price: '2500',
  bedrooms: '2',
  distanceFromUCLA: '0.5',
  leaseDuration: '1 year'
};

// ============================================================================
// TEST 1: Complete User Registration and Authentication Flow
// ============================================================================
test.describe('User Authentication Flow', () => {
  test('should complete full registration and login flow', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Step 1: Navigate to registration
    await page.click('button:has-text("Get Started")');
    await expect(page).toHaveURL(/.*auth.*mode=register/);

    // Step 2: Register new user
    await page.fill('input[name="name"]', TEST_USER.name);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="confirmPassword"]', TEST_USER.password);
    
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('h1:has-text("Welcome")')).toBeVisible();
    
    await page.click('button:has-text("Logout")');

    // Step 6: Login with created credentials
    await page.click('button:has-text("Sign In")');
    await page.waitForURL(/.*auth.*mode=login/, { timeout: 5000 });
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Step 7: Verify successful login
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator(`text=${TEST_USER.name}`)).toBeVisible();
  });

  test('should validate email format and show errors', async ({ page }) => {
    await page.goto('http://localhost:3000/auth?mode=register');

    // Try invalid email
    await page.fill('input[name="email"]', 'invalidemail@gmail.com');
    await page.fill('input[name="password"]', 'TestPassword123');
    await page.click('button[type="submit"]');

    // Should show UCLA email error
    await expect(page.locator('text=/.*@ucla.edu.*/i')).toBeVisible();

    // Try valid UCLA email
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.click('button[type="submit"]');
    
    // Error should disappear
    await expect(page.locator('text=/.*@ucla.edu.*/i')).not.toBeVisible();
  });
});

// ============================================================================
// TEST 2: Complete Listing Creation and Management Flow
// ============================================================================
test.describe('Listing Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000/auth?mode=login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
  });

  test('should create, edit, and delete a listing', async ({ page }) => {
    // Step 1: Navigate to create listing page
    await page.click('text=Create New Listing');
    await expect(page).toHaveURL(/.*create-listing/);

    // Step 2: Fill out listing form
    await page.fill('input[name="title"]', TEST_LISTING.title);
    await page.fill('textarea[name="description"]', TEST_LISTING.description);
    await page.fill('input[name="address"]', TEST_LISTING.address);
    await page.fill('input[name="zipCode"]', TEST_LISTING.zipCode);
    await page.fill('input[name="country"]', TEST_LISTING.country);
    await page.fill('input[name="price"]', TEST_LISTING.price);
    await page.selectOption('select[name="bedrooms"]', TEST_LISTING.bedrooms);
    await page.fill('input[name="distanceFromUCLA"]', TEST_LISTING.distanceFromUCLA);
    await page.selectOption('select[name="leaseDuration"]', TEST_LISTING.leaseDuration);

    // Step 3: Submit the form
    await page.click('button[type="submit"]');


    // Step 5: Navigate to My Listings
    await page.click('text=My Listings');
    await page.waitForURL('**/my-listings', { timeout: 5000 });

    // Step 6: Edit the listing
    await page.click('button:has-text("Edit")', { force: true });
    await page.waitForSelector('.edit-form-container');
    
    const newTitle = 'Updated Modern 2BR Apartment';
    await page.fill('input[name="title"]', newTitle);
    await page.click('button:has-text("Save Changes")');

    // Step 7: Verify edit was successful
    await expect(page.locator(`text=${newTitle}`)).toBeVisible();

    // Step 8: Delete the listing
    page.on('dialog', dialog => dialog.accept()); // Accept confirmation dialog
    await page.click('button:has-text("Delete")', { force: true });

    // Step 9: Verify listing was deleted
    await page.waitForTimeout(1000); // Wait for deletion
    await expect(page.locator(`text=${newTitle}`)).not.toBeVisible();
  });
});

// ============================================================================
// TEST 3: Search and Filter Functionality
// ============================================================================
test.describe('Search and Filter Listings', () => {
  test('should search and filter listings effectively', async ({ page }) => {
    // Can be accessed as guest
    await page.goto('http://localhost:3000/listings');

    // Step 1: Wait for listings to load
    await page.waitForSelector('.listing-card', { timeout: 10000 });
    const initialCount = await page.locator('.listing-card').count();
    expect(initialCount).toBeGreaterThan(0);

    // Step 2: Search by title
    await page.fill('input[placeholder*="Search"]', 'Cozy Studio');
    await page.waitForTimeout(500);
    
    const searchResults = await page.locator('.listing-card').count();
    expect(searchResults).toBeLessThanOrEqual(initialCount);
    await expect(page.locator('.listing-card').first()).toContainText(/Studio/i);

    // Step 3: Clear search
    await page.fill('input[placeholder*="Search"]', '');
    await page.waitForTimeout(500);

    // Step 4: Filter by price range
    await page.fill('input[name="minPrice"]', '2000');
    await page.fill('input[name="maxPrice"]', '3000');
    await page.waitForTimeout(500);

    // Verify filtered results
    const priceFilteredCount = await page.locator('.listing-card').count();
    expect(priceFilteredCount).toBeGreaterThan(0);

    // Step 5: Filter by bedrooms
    await page.selectOption('select[name="bedrooms"]', '2');
    await page.waitForTimeout(500);

    // Step 6: Filter by distance
    await page.fill('input[name="maxDistance"]', '0.5');
    await page.waitForTimeout(500);

    // Step 7: Filter by availability
    await page.selectOption('select[name="availability"]', 'Available');
    await page.waitForTimeout(500);

    // Step 8: Clear all filters
    await page.click('button:has-text("Clear Filters")');
    await page.waitForTimeout(500);

    // Should return to showing all listings
    const finalCount = await page.locator('.listing-card').count();
    expect(finalCount).toBe(initialCount);
  });

  test('should handle no results gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000/listings');
    await page.waitForSelector('.listing-card');

    // Apply filters that will return no results
    await page.fill('input[name="minPrice"]', '10000');
    await page.fill('input[name="maxPrice"]', '20000');
    await page.waitForTimeout(500);

    // Should show "no listings" message
    await expect(page.locator('text=/No listings.*match/i')).toBeVisible();
  });
});