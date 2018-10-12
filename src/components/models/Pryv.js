// @flow

import axios from 'axios';
import Hostings from './Hostings.js';
import type {AcceptedAuthState, RefusedAuthState, ErrorAuthState} from './AuthStates.js';
import type PermissionsList from './Permissions.js';
import type {HostingArray} from './Hostings.js';

type AuthState = AcceptedAuthState|RefusedAuthState|ErrorAuthState;

type AppCheck = {
  permissions: {},
  match: {},
  mismatch: {},
};

type NewUser = {
  username: string,
  server: string,
};

type ServiceInfos = {
  version: string,
  register: string,
  access: string,
  api: string,
  name: string,
  home: string,
  support: string,
  terms: string,
}

class Pryv {
  core: (string) => string;
  register: string;
  appId: string;
  origin: ?string;

  constructor (domain: string, appId: string, origin: ?string) {
    this.core = username => `https://${username}.${domain}`;
    this.register = `https://reg.${domain}`;
    this.appId = appId;
    this.origin = origin;
  }

  // ---------- AUTH calls ----------

  // GET/reg: polling with according poll key
  async poll (pollKey: string): Promise<AuthState> {
    return axios.get(`${this.register}/access/${pollKey}`);
  }

  // POST/reg: advertise updated auth state
  async updateAuthState (pollKey: string, authState: AuthState): Promise<number> {
    const res = await axios.post(
      `${this.register}/access/${pollKey}`,
      authState.body
    );
    return res.status;
  }

  // POST/core: login with Pryv credentials
  async login (username: string, password: string): Promise<string> {
    const res = await axios.post(
      `${this.core(username)}/auth/login`, {
        username: username,
        password: password,
        appId: this.appId,
      }
    );
    return res.data.token;
  }

  // POST/core: check if requested app access already exists or not,
  // answering with one of the three:
  // 1. checkedPermissions: corrected permissions if the access does not exists yet
  // 2. match: existing access with matching permissions
  // 3. mismatch: existing access with mismatching permissions
  async checkAppAccess (username: string, permissions: PermissionsList,
    personalToken: string, deviceName: ?string): Promise<AppCheck> {
    const res = await axios.post(
      `${this.core(username)}/accesses/check-app`, {
        requestingAppId: this.appId,
        requestedPermissions: permissions,
        deviceName: deviceName,
      }, {
        headers: { Authorization: personalToken },
      }
    );
    const data = res.data;
    return {
      permissions: data.checkedPermissions,
      match: data.matchingAccess,
      mismatch: data.mismatchingAccess,
    };
  }

  // POST/core: create a new app access, returns the according app token
  async createAppAccess (username: string, permissions: PermissionsList,
    personalToken: string, appToken: ?string, expireAfter: ?number): Promise<string> {
    const res = await axios.post(
      `${this.core(username)}/accesses`, {
        name: this.appId,
        type: 'app',
        permissions: permissions,
        token: appToken,
        expireAfter: expireAfter,
      }, {
        headers: { Authorization: personalToken },
      }
    );
    return res.data.access.token;
  }

  // ---------- REGISTER calls ----------

  // GET/reg: retrieve all available Pryv hostings
  async getAvailableHostings (): Promise<HostingArray> {
    const res = await axios.get(
      `${this.register}/hostings`
    );
    return new Hostings().parse(res.data);
  }

  // POST/reg: create a new Pryv user
  async createUser (username: string, password: string, email: string,
    hosting: string, lang: string, invitation: ?string, referer: ?string): Promise<NewUser> {
    const res = await axios.post(
      `${this.register}/user`, {
        appid: this.appId,
        username: username,
        password: password,
        email: email,
        hosting: hosting,
        languageCode: lang || 'en',
        invitationtoken: invitation || 'enjoy',
        referer: referer,
      }
    );
    return res.data;
  }

  // GET/reg: convert email to Pryv username
  async getUsernameForEmail (usernameOrEmail: string): Promise<string> {
    if (usernameOrEmail.search('@') < 0) {
      return usernameOrEmail;
    }
    const res = await axios.get(
      `${this.register}/${usernameOrEmail}/uid`
    );
    return res.data.uid;
  }

  // ---------- RESET calls ----------

  // POST/core: request a password reset
  async requestPasswordReset (username: string): Promise<number> {
    const res = await axios.post(
      `${this.core(username)}/account/request-password-reset`, {
        appId: this.appId,
        username: username,
      }, {
        headers: { Origin: this.origin },
      }
    );
    return res.status;
  }

  // POST/core: change Pryv password using a reset token
  async changePassword (username: string, newPassword: string,
    resetToken: string): Promise<number> {
    const res = await axios.post(
      `${this.core(username)}/account/reset-password`, {
        username: username,
        newPassword: newPassword,
        appId: this.appId,
        resetToken: resetToken,
      }, {
        headers: { Origin: this.origin },
      }
    );
    return res.status;
  }

  // ---------- UTILS calls ----------

  // GET/reg: retrieve service information
  async getServiceInfo (): Promise<ServiceInfos> {
    const res = await axios.get(
      `${this.register}/service/infos`);
    return res.data;
  }
}

export default Pryv;
