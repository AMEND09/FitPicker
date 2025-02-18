import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react({
            // Add fast refresh options
            fastRefresh: true,
            include: '**/*.{jsx,tsx}',
        })],
    base: '/FitPicker/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            onwarn(warning, warn) {
                // Suppress "use client" warnings
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('"use client"')) {
                    return;
                }
                warn(warning);
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'] // Add explicit extensions
    },
    server: {
        port: 5173,
        host: true,
    },
    optimizeDeps: {
        include: ['react', 'react-dom']
    }
});
