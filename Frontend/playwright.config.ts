import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  }
}
export default config
