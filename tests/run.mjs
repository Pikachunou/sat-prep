import { mkdir } from 'node:fs/promises';
import { build } from 'esbuild';

await mkdir('.test-build',{recursive:true});
await build({entryPoints:['tests/practice-entry.ts'],bundle:true,platform:'node',format:'esm',outfile:'.test-build/practice-bundle.mjs'});
await build({entryPoints:['lib/browser-store.ts'],bundle:true,platform:'node',format:'esm',outfile:'.test-build/browser-store.mjs'});
await import('./practice.test.mjs');
await import('./math.test.mjs');
await import('./full-tests.test.mjs');
await import('./storage.test.mjs');
await build({entryPoints:['app/dashboard.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',define:{'import.meta.env.BASE_URL':'"./"'},outfile:'.test-build/ui-bundle.mjs'});
await import('./ui.test.mjs');
