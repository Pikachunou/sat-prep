import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins:[react()],
  // Relative assets also work when the prebuilt docs folder is published under
  // a repository name. The Actions workflow passes GitHub's actual base path.
  base:process.env.PAGES_BASE_PATH||'./',
  resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},
  build:{outDir:'docs',emptyOutDir:true},
});
