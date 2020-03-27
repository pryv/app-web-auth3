// @flow
import PryvAPI from 'pryv';
import Pryv from './components/models/Pryv.js';
import Permissions from './components/models/Permissions.js';
import type {NeedSigninState} from './components/models/AuthStates.js';

type QueryParameters = {
  key: string,
  pryvServiceInfoUrl: string,
  lang: ?string
}

class Context {
  appId: string; // id of the web-auth app
  language: string;
  authState: AuthState; // used only in the context of a "Auth" process
  pollUrl: string; // used only in the context of a "Auth" process
  permissions: Permissions; // used only in the context of a "Auth" process
  pryv: Pryv;
  user: {
    username: string,
    personalToken: string,
    mfaToken: string,
  }
  clientData: ?{};

  constructor (queryParams: QueryParameters) {
    this.language = queryParams.lang || 'en';
    this.appId = 'pryv-app-web-auth-3';
    this.pollUrl = queryParams.poll;
    if (this.pollUrl) {
      // Context will set necessary serviceInfo during Context.init();
      this.pryv = new Pryv();
    } else {
      const domain = 'pryv.li' || domainFromUrl(); // should be depracted
      const serviceInfoUrl = queryParams.pryvServiceInfoUrl || 'https://reg.' + domain + '/service/info';
      this.pryv = new Pryv(serviceInfoUrl);
    }
    this.user = {
      username: '',
      personalToken: '',
      mfaToken: '',
    };
  }

  async init () {
    if (this.pollUrl) {
      await this.loadAuthState();
      console.log(this.authState);
      this.pryv.pryvService.setServiceInfo(this.authState.serviceInfo);
    }
    await this.pryv.init();
  }

  // in Auth process load the Poll Url
  async loadAuthState() {
    const res = await PryvAPI.utils.superagent.get(this.pollUrl).set('accept', 'json');
    if (! res.body.status ) throw new Error('Invalid data from Access server');
    this.authState = res.body;

    if (this.authState.requestedPermissions) {
      this.permissions = new Permissions(this.authState.requestedPermissions);
    }
    return this.authState ;
  }

  // POST/reg: advertise updated auth state
  async updateAuthState(authState: AuthState): Promise<number> {
    const res = await PryvAPI.utils.superagent.post(this.pollUrl).send(authState);
    this.authState = authState;
    if (this.authState.lang != null) this.language = this.authState.lang;
    console.log("XXXXX Updated Authstate", authState, res.body);
    return res.status;
  }
}

function domainFromUrl () {
  return location.hostname.split('.').slice(1).join('.');
}

export default Context;
