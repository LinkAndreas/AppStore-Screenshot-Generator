// Bundles the server (including ../src/shared) into dist/server.js. Native and font packages stay
// external and are loaded from node_modules at runtime.
import { build } from 'esbuild';

await build({
  entryPoints: ['src/server.ts'],
  outfile: 'dist/server.js',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  packages: 'external',
  banner: { js: '#!/usr/bin/env node' },
  logLevel: 'info',
});
