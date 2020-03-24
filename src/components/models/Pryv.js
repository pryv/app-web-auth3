// @flow

import PryvAPI from 'pryv';
import Hostings from './Hostings.js';
import type { AuthState } from './AuthStates.js';
import type { PermissionsList } from './Permissions.js';

type AppAccess = {
  type: 'app',
  permissions: PermissionsList,
  expires: ?number,
  token: string,
};

type AppCheck = {
  permissions: PermissionsList,
  match: AppAccess,
  mismatch: AppAccess,
};

export type NewUser = {
  username: string,
  server: string,
};

export type ServiceInfos = {
  version: string,
  register: string,
  access: string,
  api: string,
  name: string,
  home: string,
  support: string,
  terms: string,
}

type LoginResult = {
  token?: string,
  mfaToken?: string,
}

class Pryv {
  core: (string, ?string) => string;
  init: () => Promise<void>;
  pryvService: PryvAPI.Service;
  pryvServiceInfo: PryvAPI.PryvServiceInfo;

  constructor (serviceInfoUrl: string) {
    this.pryvService = new PryvAPI.Service(serviceInfoUrl);

    this.core = function (username: string, path: ?string) {
      if (this.pryvServiceInfo == null) {
        console.error('pryvServiceInfo data is not set yet, call \'init()\' and wait for service info to be loaded');
        return '';
      }
      path = path || '';
      return PryvAPI.Service.buildAPIEndpoint(this.pryvServiceInfo, username) + '/' + path;
    };
  }

  async init () {
    return this.getServiceInfo();
  }

  // ---------- AUTH calls ----------

  // GET/reg: polling with according poll key
  async poll (pollKey: string): Promise<AuthState> {
    const res = await PryvAPI.utils.superagent
      .get(this.pryvServiceInfo.access + '/' + pollKey)
      .set('accept', 'json');
    return res.body;
  }

  // POST/reg: advertise updated auth state
  async updateAuthState (pollKey: string, authState: AuthState): Promise<number> {
    const res = await PryvAPI.utils.superagent
      .post(this.pryvServiceInfo.access + '/' + pollKey)
      .send(authState);
    return res.status;
  }

  // POST/core: login with Pryv credentials
  async login (username: string, password: string, appId: string): Promise<LoginResult> {
    const res = await this.pryvService.login(username, password, appId);
    return res.body;
  }

  // POST/core: perform MFA challenge
  async mfaChallenge (username: string, mfaToken: string): Promise<void> {
    await PryvAPI.utils.superagent
      .post(this.core(username) + 'mfa/challenge')
      .set('accept', 'json')
      .set('Authorization', mfaToken)
      .send({});
  }

  // POST/core: verify MFA challenge
  async mfaVerify (username: string, mfaToken: string, code: string): Promise<string> {
    const res = await PryvAPI.utils.superagent
      .post(this.core(username) + 'mfa/verify')
      .set('accept', 'json')
      .set('Authorization', mfaToken)
      .send({ code: code });
    return res.body.token;
  }

  // POST/core: check if requested app access already exists or not,
  // answering with one of the three:
  // 1. checkedPermissions: corrected permissions if the access does not exists yet
  // 2. match: existing access with matching permissions
  // 3. mismatch: existing access with mismatching permissions
  async checkAppAccess (username: string, permissions: PermissionsList,
    personalToken: string, appId: string, deviceName: ?string): Promise<AppCheck> {
    const res = await PryvAPI.utils.superagent
      .post(this.core(username) + 'accesses/check-app')
      .set('accept', 'json')
      .set('Authorization', personalToken)
      .send({
        requestingAppId: appId,
        requestedPermissions: permissions,
        deviceName: deviceName,
      });
    const data = res.body;
    return {
      permissions: data.checkedPermissions,
      match: data.matchingAccess,
      mismatch: data.mismatchingAccess,
    };
  }

  // POST/core: create a new app access, returns the according app token
  async createAppAccess (username: string, personalToken: string,
    permissions: PermissionsList, appId: string,
    clientData: ?{}, appToken: ?string, expireAfter: ?number): Promise<AppAccess> {
    const res = await PryvAPI.utils.superagent
      .post(this.core(username) + 'accesses')
      .set('accept', 'json')
      .set('Authorization', personalToken)
      .send({
        name: appId,
        type: 'app',
        permissions: permissions,
        token: appToken,
        expireAfter: expireAfter,
        clientData: clientData,
      });
    return res.body.access;
  }

  // PUT/core: update an existing app access, returns the according app token
  async updateAppAccess (accessId: string, username: string, personalToken: string,
    permissions: PermissionsList, appId: string,
    clientData: ?{}, appToken: ?string, expireAfter: ?number): Promise<AppAccess> {
    const res = await PryvAPI.utils.superagent
      .post(this.core(username) + 'accesses/' + accessId)
      .set('accept', 'json')
      .set('Authorization', personalToken)
      .send({
        name: appId,
        type: 'app',
        permissions: permissions,
        token: appToken,
        expireAfter: expireAfter,
        clientData: clientData,
      });
    return res.body.access;
  }

  // ---------- REGISTER calls ----------

  // GET/reg: retrieve all available Pryv hostings
  async getAvailableHostings (): Promise<Hostings> {
    const res = await PryvAPI.utils.superagent
      .get(this.pryvServiceInfo.register + 'hostings')
      .set('accept', 'json');
    return new Hostings(res.body);
  }

  // POST/reg: create a new Pryv user
  async createUser (username: string, password: string, email: string,
    hosting: string, lang: string, appId: string,
    invitation: ?string, referer: ?string): Promise<NewUser> {
    const res = await PryvAPI.utils.superagent
      .post(this.pryvServiceInfo.register + 'user')
      .set('accept', 'json')
      .send({
        appid: appId,
        username: username,
        password: password,
        email: email,
        hosting: hosting,
        languageCode: lang || 'en',
        invitationtoken: invitation || 'enjoy',
        referer: referer,
      });
    return res.body;
  }

  async checkUsernameExistence (username: string): Promise<string> {
    const res = await PryvAPI.utils.superagent
      .post(this.pryvServiceInfo.register + username + '/server')
      .set('accept', 'json');
    return res.body.server;
  }

  // GET/reg: convert email to Pryv username
  async getUsernameForEmail (usernameOrEmail: string): Promise<string> {
    if (usernameOrEmail.search('@') < 0) {
      return usernameOrEmail;
    }
    const res = await PryvAPI.utils.superagent
      .get(this.pryvServiceInfo.register + usernameOrEmail + '/uid')
      .set('accept', 'json');
    return res.body.uid;
  }

  // ---------- RESET calls ----------

  // POST/core: request a password reset
  async requestPasswordReset (username: string, appId: string): Promise<number> {
    const res = await PryvAPI.utils.superagent
      .post(this.core(username) + 'account/request-password-reset')
      .set('accept', 'json')
      .send({
        name: appId,
        username: username,
      });
    return res.status;
  }

  // POST/core: change Pryv password using a reset token
  async changePassword (username: string, newPassword: string,
    resetToken: string, appId: string): Promise<number> {
    const res = await PryvAPI.utils.superagent
      .post(this.core(username) + 'account/reset-password')
      .set('accept', 'json')
      .send({
        username: username,
        newPassword: newPassword,
        appId: appId,
        resetToken: resetToken,
      });
    return res.status;
  }

  // ---------- UTILS calls ----------

  // GET/reg: retrieve service information
  async getServiceInfo (): Promise<ServiceInfos> {
    if (!this.pryvServiceInfo) {
      this.pryvServiceInfo = await this.pryvService.info();
    }
    return this.pryvServiceInfo;
  }
}

export default Pryv;
