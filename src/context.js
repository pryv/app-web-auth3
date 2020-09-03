// @flow
import Pryv from 'pryv';
import type { AccessState } from './components/models/AccessStates.js';
// augment Pryv with additional functions
import './components/models/PryvServiceExtension';
import defaults from './defaults';

type QueryParameters = {
  key: string,
  pryvServiceInfoUrl: string,
  poll: string,
  pollUrl: string; // should be removed from register's authUrl response and use "poll" only
  lang?: string,
}

class Context {
  appId: string; // id of the web-auth app
  language: string;
  accessState: AccessState; // used only in the context of a "Auth" process
  pollUrl: string; // used only in the context of a "Auth" process
  checkAppResult: Object; // use only in the context of a "Auth" process after check-app
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
    this.pollUrl = queryParams.poll || queryParams.pollUrl;
    if (this.isAccessRequest()) {
      // Context will set necessary serviceInfo during Context.init();
      this.pryvService = new Pryv.Service();
    } else {
      const serviceInfoUrl = queryParams.pryvServiceInfoUrl || defaultPryvServiceInfoUrl();
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

  isAccessRequest () {
    return this.pollUrl;
  }

  // in Auth process load the Poll Url
  async loadAccessState () {
    try {
      const res = await Pryv.utils.superagent.get(this.pollUrl).set('accept', 'json');
      this.accessState = res.body;
      return this.accessState;
    } catch (e) {
      console.log(e);
      throw new Error('Invalid data from Access server');
    }
  }

  // POST/reg: advertise updated auth state
  async updateAccessState (accessState: AccessState): Promise<number> {
    // always keep the following
    if (this.accessState && this.accessState.returnURL) {
      accessState.returnURL = this.accessState.returnURL;
    }
    const res = await Pryv.utils.superagent.post(this.pollUrl).send(accessState);
    this.accessState = accessState;
    if (this.accessState.lang != null) this.language = this.accessState.lang;
    return res.status;
  }
}

/**
 * In case default url has not been provided
 */
function defaultPryvServiceInfoUrl () {
  if (defaults.DNSLess) {
    return new URL('/reg/service/info', window.location.href).href;
  }
  const domain = location.hostname.split('.').slice(1).join('.') || 'pryv.me'; // should be depracted
  return 'https://reg.' + domain + '/service/info';
}

export default Context;
