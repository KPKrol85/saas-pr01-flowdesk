import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://127.0.0.1/'
      }
    },
    setupFiles: ['./tests/helpers/vitest.setup.js'],
    restoreMocks: true
  }
});
