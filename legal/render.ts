// Renders the static legal pages: Legal Notice and Privacy Policy from legal/content/<page>.<lang>.html,
// the Version History from CHANGELOG.md plus legal/releases.ts, and a language redirect per page.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { internalReleases, translations, type ReleaseText } from './releases';
import { languages, pagePath, pages, site, type Lang, type Page } from './site';
import { strings } from './strings';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const escapeHtml = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const format = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);

/** BCP 47 tag of a page language for lang/hreflang and Intl (the URL code may differ, e.g. pt-br → pt-BR). */
const htmlLang = (lang: Lang) => languages.find((l) => l.code === lang)?.tag ?? lang;

// ── Content ──────────────────────────────────────────────────────────────────────────────────────

function developerAddressLines() {
  const { name, address } = site.developer;
  return [`<strong>${escapeHtml(name)}</strong>`, ...address.map(escapeHtml)];
}

function developerBlock() {
  const { email } = site.developer;
  return [...developerAddressLines(), `<a href="mailto:${email}">${email}</a>`].join('<br />\n  ');
}

function documentBody(page: 'imprint' | 'privacy', lang: Lang) {
  const body = readFileSync(join(here, 'content', `${page}.${lang}.html`), 'utf8')
    .replaceAll('{{developerName}}', escapeHtml(site.developer.name))
    .replaceAll('{{developerEmail}}', site.developer.email)
    .replaceAll('{{privacyEmail}}', site.privacyEmail)
    .replaceAll('{{developerBlock}}', developerBlock())
    .replaceAll('{{developerAddress}}', developerAddressLines().join('<br />\n  '))
    .replaceAll('{{imprintUrl}}', pagePath('imprint', lang))
    .replaceAll('{{privacyUrl}}', pagePath('privacy', lang));
  const unresolved = body.match(/\{\{\w+\}\}/);
  if (unresolved) throw new Error(`Unresolved placeholder ${unresolved[0]} in legal/content/${page}.${lang}.html`);
  return body;
}

interface Release extends ReleaseText {
  version: string;
  date: string;
}

/** Releases from CHANGELOG.md, newest first, without "Unreleased" and internal-only releases. */
function changelogReleases(): Release[] {
  return readFileSync(join(root, 'CHANGELOG.md'), 'utf8')
    .split(/^## /m)
    .slice(1)
    .map((section) => {
      const [heading, ...lines] = section.trim().split('\n');
      const match = heading.match(/^\[(.+?)\](?: - (\d{4}-\d{2}-\d{2}))?/);
      const notes = lines.filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim());
      const summary = lines.find((l) => l.trim() && !l.startsWith('- '))?.trim();
      return { version: match?.[1] ?? '', date: match?.[2] ?? '', summary, notes };
    })
    .filter((r) => r.version && r.version !== 'Unreleased' && r.date && !internalReleases.has(r.version));
}

// ── Page frame ───────────────────────────────────────────────────────────────────────────────────

const brandMark = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <defs><linearGradient id="sf-bg" x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse"><stop stop-color="#8E8BFF"/><stop offset="1" stop-color="#4A46D8"/></linearGradient></defs>
        <rect width="64" height="64" rx="14.5" fill="url(#sf-bg)"/>
        <rect x="7.5" y="19" width="12" height="24" rx="3" fill="#fff" fill-opacity=".5"/>
        <rect x="44.5" y="19" width="12" height="24" rx="3" fill="#fff" fill-opacity=".5"/>
        <rect x="22" y="12" width="20" height="38" rx="4.5" fill="#fff"/>
        <rect x="28.5" y="15.2" width="7" height="2.2" rx="1.1" fill="#5B57E3"/>
        <rect x="26" y="22" width="12" height="2.6" rx="1.3" fill="#5B57E3" fill-opacity=".9"/>
        <rect x="27.5" y="27" width="9" height="1.8" rx=".9" fill="#5B57E3" fill-opacity=".45"/>
        <rect x="26" y="32" width="12" height="13.5" rx="2" fill="#5B57E3" fill-opacity=".22"/>
        <circle cx="27" cy="56" r="1.6" fill="#fff" fill-opacity=".5"/><circle cx="32" cy="56" r="1.6" fill="#fff"/><circle cx="37" cy="56" r="1.6" fill="#fff" fill-opacity=".5"/>
      </svg>`;

// Same palette as the editor (src/index.css); the editor's saved theme (localStorage "theme") wins
// over the system setting.
const styles = `
    :root {
      --bg: #f5f5f7; --card: #ffffff; --text: #1d1d1f; --soft: #424245; --muted: #6e6e73;
      --separator: rgba(60, 60, 67, 0.14); --accent: #5856d6; --accent-glow: rgba(88, 86, 214, 0.18);
      color-scheme: light;
    }
    @media (prefers-color-scheme: dark) {
      :root:not(.light-mode) {
        --bg: #1c1c1e; --card: #2c2c2e; --text: #f5f5f7; --soft: #d1d1d6; --muted: #98989d;
        --separator: rgba(84, 84, 88, 0.6); --accent: #8583ff; --accent-glow: rgba(110, 108, 240, 0.3);
        color-scheme: dark;
      }
    }
    :root.dark-mode {
      --bg: #1c1c1e; --card: #2c2c2e; --text: #f5f5f7; --soft: #d1d1d6; --muted: #98989d;
      --separator: rgba(84, 84, 88, 0.6); --accent: #8583ff; --accent-glow: rgba(110, 108, 240, 0.3);
      color-scheme: dark;
    }
    *, *::before, *::after { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; }
    body {
      margin: 0; background: var(--bg); color: var(--text);
      font: 15px/1.6 -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif;
      -webkit-font-smoothing: antialiased; overflow-wrap: break-word;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    :focus-visible { outline: 3px solid var(--accent-glow); outline-offset: 2px; border-radius: 4px; }
    .wrap { max-width: 1040px; margin: 0 auto; padding: 0 16px; }
    .topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 0; }
    .brand { display: inline-flex; align-items: center; gap: 10px; color: var(--text); font-weight: 600; font-size: 17px; letter-spacing: -0.01em; }
    .brand:hover { text-decoration: none; }
    .open-app { flex-shrink: 0; font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 999px; background: var(--accent); color: #fff; white-space: nowrap; }
    .open-app:hover { text-decoration: none; filter: brightness(1.08); }
    header.page-head { padding: 28px 0 24px; }
    h1 { margin: 0 0 8px; hyphens: auto; -webkit-hyphens: auto; font-size: clamp(28px, 5vw, 40px); line-height: 1.15; letter-spacing: -0.02em; font-weight: 700; }
    .meta { margin: 0; color: var(--muted); font-size: 14px; }
    .languages { margin: 10px 0 0; color: var(--muted); font-size: 14px; }
    .layout { display: grid; gap: 24px; padding-bottom: 48px; }
    @media (min-width: 860px) { .layout { grid-template-columns: 220px minmax(0, 1fr); align-items: start; } .toc { position: sticky; top: 24px; } }
    @media (max-width: 859px) { .page-versions .toc { display: none; } }
    .toc h2 { margin: 0 0 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); }
    .toc ol { margin: 0; padding: 0; list-style: none; font-size: 14px; }
    .toc li { margin: 0 0 6px; }
    .toc a { color: var(--soft); }
    .toc a:hover { color: var(--accent); }
    .card { background: var(--card); border-radius: 14px; padding: 8px 24px 24px; box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04); }
    .card h2 { margin: 28px 0 8px; font-size: 19px; line-height: 1.3; letter-spacing: -0.01em; scroll-margin-top: 16px; }
    .card h3 { margin: 20px 0 6px; font-size: 16px; }
    .card p, .card ul { margin: 0 0 12px; color: var(--soft); }
    .card ul { padding-left: 20px; }
    .card li { margin: 0 0 6px; }
    .card strong { color: var(--text); }
    .intro { margin-top: 20px !important; }
    .summary { padding: 14px 16px; border-radius: 10px; background: var(--accent-glow); color: var(--text) !important; }
    .release + .release { border-top: 1px solid var(--separator); }
    .release h2 { margin-bottom: 0; }
    .release .meta { margin-bottom: 10px; }
    .note { font-size: 13px; color: var(--muted) !important; }
    footer { border-top: 1px solid var(--separator); padding: 20px 0 40px; color: var(--muted); font-size: 13px; }
    footer nav { display: flex; flex-wrap: wrap; gap: 6px 18px; }
    footer a { color: var(--muted); }
    footer a[aria-current="page"] { color: var(--text); }
    @media (max-width: 520px) { .card { padding: 4px 16px 16px; } }
`;

// Applies the editor's saved theme before the first paint.
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.classList.add(t+'-mode')}catch(e){}`;

function otherLanguages(page: Page, lang: Lang) {
  return languages
    .filter((l) => l.code !== lang)
    .map((l) => `<a href="${pagePath(page, l.code)}" hreflang="${htmlLang(l.code)}" lang="${htmlLang(l.code)}">${l.name}</a>`)
    .join(' · ');
}

function tableOfContents(html: string) {
  return [...html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)]
    .map(([, id, text]) => `<li><a href="#${id}">${text}</a></li>`)
    .join('\n            ');
}

function pageTitle(page: Page, lang: Lang) {
  const t = strings[lang];
  return { imprint: t.imprintTitle, privacy: t.privacyTitle, versions: t.versionsTitle }[page];
}

function pageDescription(page: Page, lang: Lang) {
  const t = strings[lang];
  return { imprint: t.imprintDescription, privacy: t.privacyDescription, versions: t.versionsDescription }[page];
}

function renderDocument(page: Page, lang: Lang, meta: string, body: string) {
  const t = strings[lang];
  const title = pageTitle(page, lang);
  const alternates = languages
    .map((l) => `<link rel="alternate" hreflang="${htmlLang(l.code)}" href="${site.url}${pagePath(page, l.code).slice(1)}" />`)
    .join('\n    ');
  const footerLinks = pages
    .map((p) => `<a href="${pagePath(p, lang)}"${p === page ? ' aria-current="page"' : ''}>${pageTitle(p, lang)}</a>`)
    .concat(`<a href="${site.sourceUrl}" rel="noopener">${escapeHtml(strings[lang].source)}</a>`)
    .join('\n          ');

  return `<!doctype html>
<html lang="${htmlLang(lang)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} · Storyframe</title>
    <meta name="description" content="${escapeHtml(pageDescription(page, lang))}" />
    <meta name="theme-color" content="#f5f5f7" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#1c1c1e" media="(prefers-color-scheme: dark)" />
    <link rel="canonical" href="${site.url}${pagePath(page, lang).slice(1)}" />
    ${alternates}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <script>${themeScript}</script>
    <style>${styles}</style>
  </head>
  <body class="page-${page}">
    <div class="wrap">
      <div class="topbar">
        <a class="brand" href="/">
          ${brandMark}
          Storyframe
        </a>
        <a class="open-app" href="/">${t.backToApp}</a>
      </div>
      <main>
        <header class="page-head">
          <h1 id="page-title">${title}</h1>
          ${meta}
          <p class="languages">${t.otherLanguages}: ${otherLanguages(page, lang)}</p>
        </header>
        <div class="layout">
          <nav class="toc" aria-labelledby="toc-title">
            <h2 id="toc-title">${t.contents}</h2>
            <ol role="list">
            ${tableOfContents(body)}
            </ol>
          </nav>
          <article class="card" aria-labelledby="page-title">
${body}
          </article>
        </div>
      </main>
      <footer>
        <nav aria-label="Storyframe">
          ${footerLinks}
        </nav>
      </footer>
    </div>
  </body>
</html>
`;
}

// ── Pages ────────────────────────────────────────────────────────────────────────────────────────

function renderLegal(page: 'imprint' | 'privacy', lang: Lang) {
  const date = new Intl.DateTimeFormat(htmlLang(lang), { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(site.legalEffectiveDate));
  const meta = page === 'imprint' ? '' : `<p class="meta">${strings[lang].lastUpdated}: <time datetime="${site.legalEffectiveDate}">${date}</time></p>`;
  return renderDocument(page, lang, meta, documentBody(page, lang));
}

const anchor = (version: string) => `v${version.replaceAll('.', '-')}`;

function renderVersions(lang: Lang) {
  const t = strings[lang];
  const month = new Intl.DateTimeFormat(htmlLang(lang), { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const body = changelogReleases()
    .map((release) => {
      const translated = lang === 'en' ? release : translations[release.version]?.[lang];
      const text = translated ?? release;
      const english = !translated && lang !== 'en';
      const langAttr = english ? ' lang="en"' : '';
      const summary = text.summary ? `\n              <p${langAttr}>${escapeHtml(text.summary)}</p>` : '';
      const notes = text.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('\n                ');
      return `
            <section class="release" aria-labelledby="${anchor(release.version)}">
              <h2 id="${anchor(release.version)}">${format(t.version, { version: release.version })}</h2>
              <p class="meta"><time datetime="${release.date.slice(0, 7)}">${month.format(new Date(`${release.date}T12:00:00Z`))}</time></p>${english ? `\n              <p class="note">${t.englishOnly}</p>` : ''}${summary}
              <ul${langAttr}>
                ${notes}
              </ul>
            </section>`;
    })
    .join('\n');
  return renderDocument('versions', lang, `<p class="meta">${t.versionsLede}</p>`, body);
}

/** /imprint/, /privacy/ and /versions/ without a language: the browser's language, else English. */
function renderRedirect(page: Page) {
  // A browser language's primary subtag → page code (e.g. pt → pt-br, zh → zh).
  const codes = Object.fromEntries(languages.map((l) => [l.tag.split('-')[0].toLowerCase(), l.code]));
  const links = languages
    .map((l) => `<li><a href="${pagePath(page, l.code)}" hreflang="${htmlLang(l.code)}" lang="${htmlLang(l.code)}">${l.name}</a></li>`)
    .join('');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${pageTitle(page, 'en')} · Storyframe</title>
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="${site.url}${pagePath(page, 'en').slice(1)}" />
    <script>
      (function () {
        var codes = ${JSON.stringify(codes)};
        var preferred = (navigator.languages || [navigator.language]).map(function (l) { return String(l).split('-')[0].toLowerCase(); });
        var lang = 'en';
        for (var i = 0; i < preferred.length; i++) {
          if (Object.prototype.hasOwnProperty.call(codes, preferred[i])) { lang = codes[preferred[i]]; break; }
        }
        location.replace('/${page}/' + lang + '/' + location.hash);
      })();
    </script>
    <noscript><meta http-equiv="refresh" content="0; url=${pagePath(page, 'en')}" /></noscript>
  </head>
  <body>
    <ul>${links}</ul>
  </body>
</html>
`;
}

/** Every page as { "privacy/de/index.html": html, … }. */
export function renderLegalPages(): Record<string, string> {
  const files: Record<string, string> = {};
  for (const page of pages) {
    files[`${page}/index.html`] = renderRedirect(page);
    for (const { code } of languages) {
      files[`${page}/${code}/index.html`] = page === 'versions' ? renderVersions(code) : renderLegal(page, code);
    }
  }
  return files;
}
