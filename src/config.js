export const config = {
  settings: {
    appId: 'app-web-auth',
    language: 'en',
    returnURL: false,
    pryvDomain: 'pryv.me',
    pryvReg: () => `https://reg.${this.pryvDomain}`,
    pryvCore: (username) => `https://${username}.${this.pryvDomain}`,
  },
  setPryvDomain (domain) {
    this.settings.pryvDomain = domain;
  },
  setLanguage (lang) {
    this.settings.language = lang;
  },
  setAppId (id) {
    this.settings.appId = id;
  },
  setReturnUrl (url) {
    this.settings.returnURL = url;
  },
};
