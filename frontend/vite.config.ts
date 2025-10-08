//// Trigger deployment after @deck.gl/widgets fix
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { glob } from 'glob';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Determine base path based on environment
  const getBasePath = () => {
    if (mode === 'development') return '/';
    if (mode === 'github') return '/cda-transparencia/'; // GitHub Pages requires repo name as base path
    if (mode === 'production') return '/';
    return '/'; // default fallback
  };

  return {
    plugins: [
      react(),
      // Copy data directory to public during build
      {
        name: 'copy-data',
        generateBundle() {
          if (mode === 'production' || mode === 'github') {
            const dataDir = path.resolve(__dirname, '../data');
            const publicDataDir = path.resolve(__dirname, 'public/data');

            if (existsSync(dataDir)) {
              if (!existsSync(publicDataDir)) {
                mkdirSync(publicDataDir, { recursive: true });
              }

              // Copy JSON files from data directory
              const jsonFiles = glob.sync('**/*.json', { cwd: dataDir });
              jsonFiles.forEach(file => {
                const srcPath = path.join(dataDir, file);
                const destPath = path.join(publicDataDir, file);
                const destDir = path.dirname(destPath);

                if (!existsSync(destDir)) {
                  mkdirSync(destDir, { recursive: true });
                }

                try {
                  copyFileSync(srcPath, destPath);
                } catch (err) {
                  console.warn(`Failed to copy ${file}:`, err);
                }
              });

              // Copy CSV files from data directory
              const csvFiles = glob.sync('**/*.csv', { cwd: dataDir });
              csvFiles.forEach(file => {
                const srcPath = path.join(dataDir, file);
                const destPath = path.join(publicDataDir, file);
                const destDir = path.dirname(destPath);

                if (!existsSync(destDir)) {
                  mkdirSync(destDir, { recursive: true });
                }

                try {
                  copyFileSync(srcPath, destPath);
                } catch (err) {
                  console.warn(`Failed to copy ${file}:`, err);
                }
              });
            }

            // Also copy any transformed data files that were created in public/data
            const transformedDataDir = path.resolve(__dirname, 'public/data');
            if (existsSync(transformedDataDir)) {
              // This will be handled by the postbuild script in copy-data-files.js
            }
          }
        }
      }
    ],
    publicDir: 'public',
    base: getBasePath(),
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      rollupOptions: {
        external: ['@deck.gl/widgets'],
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            icons: ['lucide-react'],
            animations: ['framer-motion']
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
    },
    optimizeDeps: {
      include: ['lucide-react'],
    },
    server: {
      port: 5173,
      host: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    preview: {
      port: 4173,
      host: true,
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
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
        '@test-utils': path.resolve(__dirname, './src/test-utils')
      }
    }
  };
});
