import { defineConfig } from '@playwright/test'
import path from 'node:path'

const python = path.resolve(
  '..',
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
)
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: 'http://127.0.0.1:18761',
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: `"${python}" ../scripts/e2e_server.py`,
      url: 'http://127.0.0.1:18760/api/health/',
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: 'npm run dev -- --port 18761',
      url: 'http://127.0.0.1:18761',
      env: { BACKEND_URL: 'http://127.0.0.1:18760' },
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
})
