import { defineConfig } from '@playwright/test';

// Las pruebas E2E se ejecutan contra el sistema ENCENDIDO:
//   - API:    http://localhost:3001  (cd server-auth && npm start)
//   - Página: http://localhost:4200  (ng serve)
// Usan los usuarios de demostración creados con `npm run seed`.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    screenshot: 'only-on-failure',
    // Solo si tu Chromium está en otra ruta (no necesario en tu computadora):
    launchOptions: process.env['PW_CHROMIUM'] ? { executablePath: process.env['PW_CHROMIUM'] } : {},
  },
});
