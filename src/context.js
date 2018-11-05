import Pryv from './components/models/Pryv.js';
import Permissions from './components/models/Permissions.js';

class Context {
  constructor (queryParams) {
    const domain = domainFromUrl() || queryParams.domain || 'pryv.me';
    const appId = queryParams.requestingAppId || 'pryv-app-web-auth-3';
    this.language = queryParams.lang || 'en';
    this.appId = appId;
    this.returnURL = queryParams.returnURL;
    this.oauthState = queryParams.oauthState;
    this.permissions = new Permissions(queryParams.requestedPermissions);
    this.pollKey = queryParams.key;
    this.pryv = new Pryv(domain, appId);
  }
}

function domainFromUrl () {
  return location.hostname.split('.').slice(1).join('.');
}

export default Context;
