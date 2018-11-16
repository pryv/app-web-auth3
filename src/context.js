// @flow

import Pryv from './components/models/Pryv.js';
import Permissions from './components/models/Permissions.js';
import type {NeedSigninState} from './components/models/AuthStates.js';

type QueryParameters = {
  key: string,
  lang: ?string
}

class Context {
  domain: string;
  appId: string; // id of the web-auth app
  requestingAppId: string; // id of the app requesting access
  language: string;
  returnURL: ?string;
  oauthState: ?string;
  permissions: Permissions;
  pollKey: string;
  pryv: Pryv;
  user: {
    username: string,
    personalToken: string,
  }
  clientData: ?{};

  constructor (queryParams: QueryParameters) {
    this.domain = domainFromUrl() || 'pryv.me';
    this.language = queryParams.lang || 'en';
    this.appId = 'pryv-app-web-auth-3';
    this.pryv = new Pryv(this.domain);
    this.pollKey = queryParams.key;
    this.user = {
      username: '',
      personalToken: '',
    };
  }

  updateFromAuthState (state: NeedSigninState) {
    this.clientData = state.clientData;
    this.requestingAppId = state.requestingAppId;
    this.permissions = new Permissions(state.requestedPermissions);
    this.returnURL = state.returnURL;
    this.oauthState = state.oauthState;
    if (state.lang != null) this.language = state.lang;
  }
}

function domainFromUrl () {
  return location.hostname.split('.').slice(1).join('.');
}

export default Context;
