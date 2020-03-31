// @flow
import Pryv from 'pryv';
import PryvServiceAuth from './components/models/PryvServiceExtension';
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
  checkAppResult: Object; // use nly in the context of a "Auth" process after check-app
  pryvService: Pryv.Service;
  user: {
    username: string,
    personalToken: string,
    mfaToken: string,
  };
  initialized: boolean;

  constructor (queryParams: QueryParameters) {
    this.language = queryParams.lang || 'en';
    this.appId = 'pryv-app-web-auth-3';
    this.pollUrl = queryParams.poll;
    if (this.isAccessRequest()) {
      // Context will set necessary serviceInfo during Context.init();
      this.pryvService = new Pryv.Service();
    } else {
      const domain = domainFromUrl() || 'pryv.li'; // should be depracted
      const serviceInfoUrl = queryParams.pryvServiceInfoUrl || 'https://reg.' + domain + '/service/info';
      this.pryvService = new Pryv.Service(serviceInfoUrl);
    }
    this.user = {
      username: '',
      personalToken: '',
      mfaToken: '',
    };
    this.checkAppResult = {};
    this.initialized = false;
  }

  async init () {
    if (this.initialized) return;
    this.initialized = false;
    if (this.isAccessRequest()) {
      await this.loadAccessState();
      this.pryvService.setServiceInfo(this.accessState.serviceInfo);
    }
    await this.pryvService.info();
  }

  isAccessRequest() {
    return this.pollUrl;
  }

  // in Auth process load the Poll Url
  async loadAccessState() {
    try { 
      const res = await Pryv.utils.superagent.get(this.pollUrl).set('accept', 'json');
      if (! res.body.status ) throw new Error();
      this.accessState = res.body;
      return this.accessState;
    } catch (e) {
      console.log(e);
      throw new Error('Invalid data from Access server');
    }
  }

  // POST/reg: advertise updated auth state
  async updateAccessState(accessState: AccessState): Promise<number> {
    const res = await Pryv.utils.superagent.post(this.pollUrl).send(accessState);
    this.accessState = accessState;
    if (this.accessState.lang != null) this.language = this.accessState.lang;
    return res.status;
  }
}

function domainFromUrl () {
  return location.hostname.split('.').slice(1).join('.');
}

export default Context;
