// @flow
import Pryv from 'pryv';
import type { AccessState } from './components/models/AccessStates.js';
import type { PryvService } from './components/models/PryvServiceExtension';
// augment Pryv with additional functions
import './components/models/PryvServiceExtension';
import defaults from './defaults';
import _ from 'lodash';

type QueryParameters = {
  key: string,
  pryvServiceInfoUrl: string,
  poll: string,
  pollUrl: string; // should be removed from register's authUrl response and use "poll" only
  lang?: string,
  oauthState?: string, // ifttt
  cli?: string, // '1' when the calling app is headless and there is no popup/parent window to close or redirect
}

class Context {
  appId: string; // id of the web-auth app
  language: string;
  accessState: AccessState; // used only in the context of a "Auth" process
  pollUrl: string; // used only in the context of a "Auth" process
  checkAppResult: Object; // use only in the context of a "Auth" process after check-app
  pryvService: PryvService;
  user: {
    username: string,
    personalToken: string,
    mfaToken: string,
  };
  initialized: boolean;
  cli: boolean; // true when the auth UI was launched by a headless caller (no popup/parent window)

  constructor (queryParams: QueryParameters) {
    console.log('QUERY PARAMS', queryParams);
    this.language = queryParams.lang || 'en';
    this.appId = 'pryv-app-web-auth-3';
    this.pollUrl = queryParams.poll || queryParams.pollUrl;
    this.cli = queryParams.cli === '1';
    if (queryParams != null && queryParams.oauthState != null) {
      this.accessState = {
        oauthState: queryParams.oauthState,
      };
    }

    if (this.isAccessRequest()) {
      // Context normally sets serviceInfo from the poll response during
      // Context.init(); derive a serviceInfoUrl from the poll URL as a
      // fallback so `pryvService.info()` works even if a future server
      // stops embedding serviceInfo in the poll body.
      const fallbackServiceInfoUrl = deriveServiceInfoUrlFromPollUrl(this.pollUrl);
      this.pryvService = new Pryv.Service(fallbackServiceInfoUrl);
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

  async init (): Promise<void> {
    if (this.initialized) return;
    this.initialized = false;
    if (this.isAccessRequest()) {
      await this.loadAccessState();
      // serviceInfo may be embedded in the poll response (legacy behaviour)
      // or omitted (newer servers only embed it on the initial access POST
      // and on the ACCEPTED state). Skip setServiceInfo if absent — the
      // pryvService.info() call below falls back to fetching it from
      // the platform's /service/info endpoint.
      if (this.accessState.serviceInfo) {
        this.pryvService.setServiceInfo(this.accessState.serviceInfo);
      }
    }
    await this.pryvService.info();
  }

  isAccessRequest (): boolean {
    return this.pollUrl != null;
  }

  // in Auth process load the Poll Url
  async loadAccessState (): ?AccessState {
    try {
      const res = await Pryv.utils.superagent.get(this.pollUrl).set('accept', 'json');
      this.accessState = _.merge(this.accessState, res.body);
      if (this.accessState.lang != null) this.language = this.accessState.lang;
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
    this.accessState = _.merge(this.accessState, accessState);
    if (this.accessState.lang != null) this.language = this.accessState.lang;
    return res.status;
  }
}

/**
 * The poll URL is always shaped `{coreUrl}/reg/access/{key}` (see
 * open-pryv.io `routes/reg/access.ts`). Replace the trailing
 * `access/{key}` with `service/info` to get a service-info URL on the
 * same core. Returns null if the URL doesn't match the expected shape.
 */
function deriveServiceInfoUrlFromPollUrl (pollUrl: ?string): ?string {
  if (pollUrl == null) return null;
  const m = /^(.*\/reg\/)access\/[^/]+\/?$/.exec(pollUrl);
  if (m == null) return null;
  return m[1] + 'service/info';
}

/**
 * In case default url has not been provided
 */
function defaultPryvServiceInfoUrl (): string {
  if (defaults.DNSLess) {
    return new URL('/reg/service/info', window.location.href).href;
  }
  const domain = location.hostname.split('.').slice(1).join('.') || 'pryv.me'; // should be depracted
  return 'https://reg.' + domain + '/service/info';
}

export default Context;
