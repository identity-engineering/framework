import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [tailwind(), react()],
  site: 'https://identity-engineering.org',
  // No floating Astro toolbar in local dev (production never shows it)
  devToolbar: { enabled: false },
});