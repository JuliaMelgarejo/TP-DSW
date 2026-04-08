import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['scr/test/**/*.test.ts'],
    exclude: ['node_modules', 'dist']
  }
})