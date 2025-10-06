import { test, expect } from '@playwright/test'

// This test drives the core flow: search -> view flight -> checkout -> confirm -> dashboard
// Assumes dev server runs with mock data available in mocks/flights.json

test('search -> flight -> checkout -> confirm -> dashboard', async ({ page }) => {
  // Go home
  await page.goto('/')

  // If logged in from previous run, log out to start fresh
  const logout = page.locator('button:has-text("Logout")')
  if (await logout.count()) {
    await logout.first().click()
  }

  // Signup quickly to ensure we have a user
  await page.getByRole('link', { name: 'Sign Up' }).click()
  await page.getByLabel('Name').fill('Test User')
  await page.getByLabel('Email').fill(`test${Date.now()}@example.com`)
  await page.getByLabel('Password').fill('password')
  await page.getByLabel('Role (mock)').selectOption('USER')
  await page.getByRole('button', { name: 'Sign Up' }).click()

  // Should be on dashboard
  await expect(page.getByText('My Bookings')).toBeVisible()

  // Go home
  await page.getByRole('link', { name: 'Home' }).click()

  // Seed a guaranteed flight in localStorage to ensure results exist
  const today = new Date().toISOString().slice(0,10)
  await page.evaluate((d)=>{
    const flights = JSON.parse(localStorage.getItem('mock_company_flights')||'[]')
    const id = Date.now()
    const flight = {
      id,
      company_id: 9999,
      company_name: 'Playwright Air',
      flight_number: 'PW-101',
      origin: 'NYC',
      destination: 'LAX',
      departure_time: d + 'T09:00:00',
      arrival_time: d + 'T12:30:00',
      duration_minutes: 210,
      stops: 0,
      price: 199.99,
      seats_total: 180,
      seats_available: 50,
      active: true,
    }
    localStorage.setItem('mock_company_flights', JSON.stringify([flight, ...flights]))
  }, today)

  // Fill search bar
  await page.getByLabel('Origin').fill('NYC')
  await page.getByLabel('Destination').fill('LAX')
  await page.getByLabel('Date').fill(today)
  await page.getByLabel('Passengers').fill('1')
  await page.getByRole('button', { name: 'Search' }).click()

  // On search results
  await expect(page.getByText('Search Results')).toBeVisible()

  // Click View on the first flight (should exist because we seeded one)
  const viewButtons = page.getByRole('link', { name: 'View' })
  await expect(viewButtons.first()).toBeVisible()
  await viewButtons.first().click()

    // Flight details
    await expect(page.getByText('Flight Details')).toBeVisible()

    // Book
    await page.getByRole('button', { name: 'Book' }).click()

    // Checkout
    await expect(page.getByText('Checkout')).toBeVisible()
    await page.getByLabel('First name').fill('John')
    await page.getByLabel('Last name').fill('Doe')
    await page.getByLabel('Email').fill('john.doe@example.com')
    await page.getByLabel('Phone').fill('1234567890')
    await page.getByRole('button', { name: 'Confirm & Pay' }).click()

  // Confirmation
  await expect(page.getByText('Booking Confirmation')).toBeVisible()

    // Dashboard lists the ticket
    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page.getByText('Ticket #')).toBeVisible()
})
