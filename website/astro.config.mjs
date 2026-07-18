import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://identity-engineering.org',
  integrations: [
    tailwind(),
    react({
      include: ['**/components/**/*.{tsx,jsx}', '**/src/**/*.{tsx,jsx}'],
    }),
  ],
  devToolbar: { enabled: false },
  vite: {
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
