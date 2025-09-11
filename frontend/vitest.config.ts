/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh in tests
      fastRefresh: true,
      // Include .jsx files
      include: '**/*.{jsx,tsx}',
    }),
  ],
  
  test: {
    // Test environment setup
    setupFiles: ['./src/vitest.setup.ts'],
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    
    // Global test configuration
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: 'coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test-setup.ts',
        '**/__tests__/**',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/coverage/**',
        '**/build/**',
        '**/.next/**',
        '**/public/**',
        '**/static/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 80,
          statements: 80,
        },
        // Higher thresholds for critical components
        './src/components/charts/': {
          branches: 80,
          functions: 80,
          lines: 85,
          statements: 85,
        },
        './src/services/': {
          branches: 75,
          functions: 75,
          lines: 85,
          statements: 85,
        },
      },
      include: [
        'src/**/*.{ts,tsx,js,jsx}',
      ],
    },
    
    // Test file patterns
    include: [
      '**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
      '**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.next/**',
      'coverage/**',
    ],
    
    // Test timeout configuration
    testTimeout: 10000, // 10 seconds
    hookTimeout: 10000, // 10 seconds
    teardownTimeout: 5000, // 5 seconds
    
    // Concurrent test execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
        minForks: 1,
        maxForks: 4,
      },
    },
    
    // Reporter configuration
    reporters: [
      'default',
      'html',
      'json',
    ],
    outputFile: {
      html: './test-results/html/index.html',
      json: './test-results/json/results.json',
    },
    
    // Watch mode configuration
    watch: false,
    
    // Retry configuration for flaky tests
    retry: 2,
    
    // Test isolation
    isolate: true,
    
    // Mock configuration
    deps: {
      inline: [
        // Inline dependencies that need to be transformed
        '@testing-library/react',
        '@testing-library/jest-dom',
        'recharts',
        'lucide-react',
        'framer-motion',
        'react-i18next',
        'i18next',
        '@tanstack/react-query',
        'zod',
      ],
    },
    
    // Environment variables for tests
    env: {
      NODE_ENV: 'test',
      VITE_API_URL: 'http://localhost:3001',
      VITE_CACHE_DURATION: '600000',
      VITE_RETRY_ATTEMPTS: '3',
      VITE_ANALYTICS_KEY: 'test-analytics-key',
      VITE_ERROR_TRACKING: 'disabled',
    },
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@schemas': path.resolve(__dirname, './src/schemas'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@i18n': path.resolve(__dirname, './src/i18n'),
      '@test-utils': path.resolve(__dirname, './src/test-utils'),
    },
  },
  
  // Build configuration for tests
  esbuild: {
    target: 'node14',
  },
  
  // Define global constants
  define: {
    'import.meta.vitest': 'undefined',
    __DEV__: 'true',
    __TEST__: 'true',
  },
});