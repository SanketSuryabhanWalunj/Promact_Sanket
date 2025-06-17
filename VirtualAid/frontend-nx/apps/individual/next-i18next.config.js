const HttpBackend = require('i18next-http-backend/cjs');
const ChainedBackend = require('i18next-chained-backend').default;

const isBrowser = typeof window !== 'undefined';

/** @type {import('next-i18next').UserConfig} */
module.exports = {
  debug: process.env.NODE_ENV === 'development',
  backend: {
    backends: typeof window !== 'undefined' ? [HttpBackend] : [],
  },
  i18n: {
    defaultLocale: 'nl',
    locales: ['nl', 'en', 'ar', 'uk', 'de'],
    localeDetection: false
  },
  partialBundledLanguages: isBrowser && true,
  serializeConfig: false,
  use: typeof window !== 'undefined' ? [ChainedBackend] : [],
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
