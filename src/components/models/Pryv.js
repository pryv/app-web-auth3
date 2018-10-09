// @flow

import axios from 'axios';
import Hostings from './Hostings.js';
import type {AcceptedAuthState, RefusedAuthState, ErrorAuthState} from './AuthStates.js';
import type PermissionsList from './Permissions.js';
type AuthState = AcceptedAuthState|RefusedAuthState|ErrorAuthState;
type ErrorHandler = (Error|string) => void;

class Pryv {
  core: (string) => string;
  register: string;
  appId: string;
  origin: ?string;
  next: ErrorHandler;

  constructor (domain: string, appId: string, handler: ErrorHandler, origin: ?string) {
    this.core = username => `https://${username}.${domain}`;
    this.register = `https://reg.${domain}`;
    this.appId = appId;
    this.next = handler;
    this.origin = origin;
  }

  // ---------- AUTH calls ----------

  // GET/reg: polling with according poll key
  async poll (pollKey: string) {
    return this.asyncCall(axios.get,
      `${this.register}/access/${pollKey}`
    );
  }

  // POST/reg: advertise updated auth state
  async updateAuthState (pollKey: string, authState: AuthState) {
    return this.asyncCall(axios.post,
      `${this.register}/access/${pollKey}`,
      authState.body
    );
  }

  // POST/core: login with Pryv credentials
  async login (username: string, password: string) {
    const res = await this.asyncCall(axios.post,
      `${this.core(username)}/auth/login`, {
        username: username,
        password: password,
        appId: this.appId,
      }
    );
    return res ? res.data.token : null;
  }

  // POST/core: check if requested app access already exists or not,
  // answering with one of the three:
  // 1. checkedPermissions: corrected permissions if the access does not exists yet
  // 2. match: existing access with matching permissions
  // 3. mismatch: existing access with mismatching permissions
  async checkAppAccess (username: string, permissions: PermissionsList,
    personalToken: string, deviceName: ?string) {
    const res = await this.asyncCall(axios.post,
      `${this.core(username)}/accesses/check-app`, {
        requestingAppId: this.appId,
        requestedPermissions: permissions,
        deviceName: deviceName,
      }, {
        headers: { Authorization: personalToken },
      }
    );
    const data = res.data;
    return data ? {
      permissions: data.checkedPermissions,
      match: data.matchingAccess,
      mismatch: data.mismatchingAccess,
    } : null;
  }

  // POST/core: create a new app access, returns the according app token
  async createAppAccess (username: string, permissions: PermissionsList,
    personalToken: string, appToken: ?string, expireAfter: ?number) {
    const res = await this.asyncCall(axios.post,
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
    return res ? res.data.access.token : null;
  }

  // ---------- REGISTER calls ----------

  // GET/reg: retrieve all available Pryv hostings
  async getAvailableHostings () {
    const res = await this.asyncCall(axios.get,
      `${this.register}/hostings`
    );
    return res ? new Hostings().parse(res.data) : [];
  }

  // POST/reg: create a new Pryv user
  async createUser (username: string, password: string, email: string,
    hosting: string, lang: string, invitation: ?string, referer: ?string) {
    return this.asyncCall(axios.post,
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
  }

  // GET/reg: convert email to Pryv username
  async getUsernameForEmail (email: string) {
    const res = await this.asyncCall(axios.get,
      `${this.register}/${email}/uid`
    );
    return res ? res.data.uid : null;
  }

  // ---------- RESET calls ----------

  // POST/core: request a password reset
  async requestPasswordReset (username: string) {
    const res = await this.asyncCall(axios.post,
      `${this.core(username)}/account/request-password-reset`, {
        appId: this.appId,
        username: username,
      }, {
        headers: { Origin: this.origin },
      }
    );
    return res ? res.status : null;
  }

  // POST/core: change Pryv password using a reset token
  async changePassword (username: string, newPassword: string, resetToken: string) {
    return this.asyncCall(axios.post,
      `${this.core(username)}/account/reset-password`, {
        username: username,
        newPassword: newPassword,
        appId: this.appId,
        resetToken: resetToken,
      }, {
        headers: { Origin: this.origin },
      }
    );
  }

  // ---------- UTILS calls ----------

  // GET/reg: retrieve service information
  async getServiceInfo () {
    return this.asyncCall(axios.get,
      `${this.register}/service/info`);
  }

  // Perform async calls using await and try/catch mechanisms
  async asyncCall<U, T> (fun: (...args: Array<U>) => Promise<T>, ...params: Array<U>): Promise<T> {
    try {
      const res = await fun(...params);
      return res;
    } catch (err) {
      this.next(JSON.stringify(err));
    }
  }
}

export default Pryv;
