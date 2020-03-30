// @flow
import PryvAPI from 'pryv';
import Pryv from './components/models/Pryv.js';
import Permissions from './components/models/Permissions.js';
import type {NeedSigninState} from './components/models/AccessStates.js';

type QueryParameters = {
  key: string,
  pryvServiceInfoUrl: string,
  lang: ?string
}

class Context {
  appId: string; // id of the web-auth app
  language: string;
  accessState: AccessState; // used only in the context of a "Auth" process
  pollUrl: string; // used only in the context of a "Auth" process
  // permissions might be refactored eepending on "Check-App Process"
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
    if (this.isAccessRequest()) {
      // Context will set necessary serviceInfo during Context.init();
      this.pryv = new Pryv();
    } else {
      const domain = domainFromUrl() || 'pryv.li'; // should be depracted
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
    if (this.isAccessRequest()) {
      await this.loadAccessState();
      console.log(this.accessState);
      this.pryv.pryvService.setServiceInfo(this.accessState.serviceInfo);
    }
    await this.pryv.init();
  }

  isAccessRequest() {
    return this.pollUrl;
  }

  // in Auth process load the Poll Url
  async loadAccessState() {
    const res = await PryvAPI.utils.superagent.get(this.pollUrl).set('accept', 'json');
    if (! res.body.status ) throw new Error('Invalid data from Access server');
    this.accessState = res.body;

    if (this.accessState.requestedPermissions) {
      this.permissions = new Permissions(this.accessState.requestedPermissions);
    }
    return this.accessState ;
  }

  // POST/reg: advertise updated auth state
  async updateAccessState(accessState: AccessState): Promise<number> {
    const res = await PryvAPI.utils.superagent.post(this.pollUrl).send(accessState);
    this.accessState = accessState;
    if (this.accessState.lang != null) this.language = this.accessState.lang;
    return res.status;
  }
}

function domainFromUrl () {
  return location.hostname.split('.').slice(1).join('.');
}

export default Context;
