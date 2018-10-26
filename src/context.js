import Pryv from './components/models/Pryv.js';
import Permissions from './components/models/Permissions.js';

class Context {
  constructor () {
    throw new Error('Impossible to instantiate static Context!');
  }

  static init (params) {
    const domain = domainFromUrl() || params.domain || 'pryv.me';
    const appId = params.requestingAppId || 'app-web-auth';

    this.language = params.lang || 'en';
    this.appId = appId || 'pryv-app-web-auth-3';
    this.returnURL = params.returnURL;
    this.oauthState = params.oauthState;
    this.permissions = new Permissions(params.requestedPermissions);
    this.pollKey = params.key;
    this.pryv = new Pryv(domain, appId);
  }
}

function domainFromUrl () {
  return location.hostname.split('.').slice(1).join('.');
}

export default Context;
