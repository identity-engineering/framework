import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://identity-engineering.org',
  integrations: [
    react({
      include: ['**/components/**/*.{tsx,jsx}', '**/src/**/*.{tsx,jsx}'],
    }),
  ],
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 900,
    },
    ssr: {
      // Ensure R3F packages are processed correctly when touched by SSR tooling
      noExternal: ['@react-three/fiber', '@react-three/drei', 'three'],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'three',
        '@react-three/fiber',
        '@react-three/drei',
      ],
    },
  },
});
