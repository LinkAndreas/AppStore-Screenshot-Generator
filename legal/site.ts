// Settings for the static legal pages (Legal Notice, Privacy Policy, Version History) that are
// served next to the app at /imprint/<lang>/, /privacy/<lang>/ and /versions/<lang>/.

export const site = {
  /** Canonical, absolute URL of the deployed app, with a trailing slash. */
  url: 'https://screenshots.linkandreas.de/',
  privacyEmail: 'privacy@linkandreas.de',

  /** The provider of the app, named in the legal pages. */
  developer: {
    name: 'Andreas Link',
    email: 'feedback@linkandreas.de',
    address: ['Schwarzwaldstr. 22', '76473 Iffezheim', 'Deutschland'],
  },

  /** Effective date of the legal pages (ISO). Update whenever their text changes. */
  legalEffectiveDate: '2026-11-21',
};

/**
 * Languages of the pages: the app's UI languages (src/translations.ts), in switcher order. `code`
 * is the URL segment and content file suffix (lowercase, the same codes as the developer's other
 * sites, e.g. pt-br, zh), `tag` the BCP 47 tag for lang/hreflang and Intl, `locale` the app's UI
 * language id it serves (src/components/LeftSidebar.tsx maps it to `code`).
 */
export const languages = [
  { code: 'en', tag: 'en', locale: 'en-US', name: 'English' },
  { code: 'de', tag: 'de', locale: 'de-DE', name: 'Deutsch' },
  { code: 'fr', tag: 'fr', locale: 'fr-FR', name: 'Français' },
  { code: 'es', tag: 'es', locale: 'es-ES', name: 'Español' },
  { code: 'it', tag: 'it', locale: 'it-IT', name: 'Italiano' },
  { code: 'pt-br', tag: 'pt-BR', locale: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'nl', tag: 'nl', locale: 'nl-NL', name: 'Nederlands' },
  { code: 'ja', tag: 'ja', locale: 'ja-JP', name: '日本語' },
  { code: 'ko', tag: 'ko', locale: 'ko-KR', name: '한국어' },
  { code: 'zh', tag: 'zh-Hans', locale: 'zh-CN', name: '简体中文' },
  { code: 'ru', tag: 'ru', locale: 'ru-RU', name: 'Русский' },
] as const;

export type Lang = (typeof languages)[number]['code'];

export const pages = ['imprint', 'privacy', 'versions'] as const;
export type Page = (typeof pages)[number];

/** Absolute path of a page in a language, e.g. /privacy/de/. */
export const pagePath = (page: Page, lang: Lang) => `/${page}/${lang}/`;
