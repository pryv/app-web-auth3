const config = {
  settings: {
    appId: 'app-web-auth',
    language: 'en',
    returnURL: false,
    pryvDomain: 'pryv.me',
    pryvReg: () => `https://reg.${this.pryvDomain}`,
    pryvCore: (username) => `https://${username}.${this.pryvDomain}`,
  },
  setPryvDomain (domain) {
    if (domain) this.settings.pryvDomain = domain;
  },
  setLanguage (lang) {
    if (lang) this.settings.language = lang;
  },
  setAppId (id) {
    if (id) this.settings.appId = id;
  },
  setReturnUrl (url) {
    if (url) this.settings.returnURL = url;
  },
  init (params) {
    this.setPryvDomain(params.domain);
    this.setLanguage(params.lang);
    this.setAppId(params.requestingAppId);
    this.setReturnUrl(params.returnURL);
  },
};

export default config;
