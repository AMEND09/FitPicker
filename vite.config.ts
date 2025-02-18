import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['img.png'],
            manifest: {
                name: 'FitPicker',
                short_name: 'FitPicker',
                description: 'Weather-based wardrobe suggestions',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: 'img.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                display: 'standalone',
                scope: '.',
                start_url: '/',
                background_color: '#ffffff'
            }
        })
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    },
    base: './'
});
