import Pryv from './components/models/Pryv.js';

const context = {
  settings: {
    appId: 'app-web-auth',
    language: 'en',
    returnURL: null,
    pryvDomain: 'pryv.me',
    oauthState: null,
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
  setOauthState (oauthState) {
    if (oauthState) this.settings.oauthState = oauthState;
  },
  init (params) {
    this.setPryvDomain(params.domain);
    this.setLanguage(params.lang);
    this.setAppId(params.requestingAppId);
    this.setReturnUrl(params.returnURL);
    this.setOauthState(params.oauthState);

    this.pryv = new Pryv(this.settings.pryvDomain, this.settings.appId);
  },
};

export default context;
