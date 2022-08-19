import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";

import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), react(), svelte(), image(), tailwind({
    config: {
      applyBaseStyles: false
    }
  }), sitemap()]
});