import type { Plugin } from 'vite';
import { renderLegalPages } from './render';

/**
 * Serves the static legal pages (/imprint/, /privacy/, /versions/ and their /<lang>/ pages) in the
 * dev server and writes them into dist/ as <page>/<lang>/index.html at build time.
 */
export function legalPages(): Plugin {
  return {
    name: 'storyframe-legal-pages',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split(/[?#]/)[0];
        const match = path.match(/^\/(imprint|privacy|versions)(\/[a-z]{2}(?:-[a-z]{2})?)?\/?$/);
        if (!match) return next();
        // Rendered on every request, so edits to the content show up on reload.
        const html = renderLegalPages()[`${match[1]}${match[2] ?? ''}/index.html`];
        if (!html) return next();
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);
      });
    },

    generateBundle() {
      for (const [fileName, source] of Object.entries(renderLegalPages())) {
        this.emitFile({ type: 'asset', fileName, source });
      }
    },
  };
}
