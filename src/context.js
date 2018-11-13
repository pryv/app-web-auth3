// @flow

import Pryv from './components/models/Pryv.js';
import Permissions from './components/models/Permissions.js';
import type {NeedSigninState} from './components/models/AuthStates.js';

class Context {
  domain: string;
  appId: string;
  language: string;
  returnURL: string;
  oauthState: string;
  permissions: Permissions;
  pollKey: string;
  pryv: Pryv;
  user: {
    username: string,
    personalToken: string,
  }
  clientData: mixed;

  constructor (queryParams) {
    this.domain = domainFromUrl() || 'pryv.me';
    this.language = 'en';
    this.appId = 'pryv-app-web-auth-3';
    this.pryv = new Pryv(this.domain, this.appId);
    this.pollKey = queryParams.key;
    this.user = {
      username: '',
      personalToken: '',
    };
  }

  syncFromAuthState (state: NeedSigninState) {
    this.clientData = state.clientData;
    this.appId = state.requestingAppId;
    this.permissions = new Permissions(state.requestedPermissions);
    this.pryv = new Pryv(this.domain, this.appId);
    this.returnURL = state.returnURL;
    this.oauthState = state.oauthState;
    this.language = state.lang;
  }
}

function domainFromUrl () {
  return location.hostname.split('.').slice(1).join('.');
}

export default Context;
