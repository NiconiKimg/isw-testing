import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'bu64z5',
  video: true,
  screenshotOnRunFailure: true,
  e2e: {
    baseUrl: 'http://127.0.0.1:4173',
    supportFile: false,
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 800,
    setupNodeEvents(_on, _config) {
      // Node event listeners
    }
  }
});
