import Vue from 'vue';
import VueI18n from 'vue-i18n';

const config = require('../config/i18n.config');

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: config.locale || 'en',
  fallbackLocale: config.fallbackLocale || 'en',
  messages: loadLocaleMessages(),
});

function loadLocaleMessages () {
  const locales = require.context('../locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  return messages;
};

export default i18n;
