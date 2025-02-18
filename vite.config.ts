import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    plugins: [
        react({
            fastRefresh: true,
            include: '**/*.{jsx,tsx}',
        }),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'icons/*'],
            manifest: {
                name: 'Fit Picker',
                short_name: 'FitPicker',
                description: 'Weather-based wardrobe assistant',
                theme_color: '#000000',
                icons: [
                    {
                        src: 'icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']  // Add explicit extensions
    },
    server: {
        port: 5173,
        host: true,
    },
    optimizeDeps: {
        include: ['react', 'react-dom']
    }
});
