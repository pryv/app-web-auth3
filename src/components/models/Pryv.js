import axios from 'axios';
import Hostings from '../controllers/Hostings.js';

class Pryv {
  constructor (domain, appId, origin) {
    this.core = username => `https://${username}.${domain}`;
    this.register = `https://reg.${domain}`;
    this.appId = appId;
    this.origin = origin;
    this.next = () => {};
  }

  // ---------- AUTH calls ----------
  async poll (pollKey) {
    return this.asyncCall(axios.get,
      `${this.register}/access/${pollKey}`
    );
  }

  async updateAuthState (pollKey, authState) {
    // TODO: flowtype authState
    // authState.status === REFUSED
    // authState.reasonID
    // authState.message
    // authState.status === ERROR
    // authState.id
    // authState.message
    // authState.detail
    // authState.status === ACCEPTED
    // authState.username
    // authState.token
    return this.asyncCall(axios.post,
      `${this.register}/access/${pollKey}`,
      {authState}
    );
  }

  async login (username, password) {
    const res = await this.asyncCall(axios.post,
      `${this.core(username)}/auth/login`, {
        username: username,
        password: password,
        appId: this.appId,
      }
    );
    return res.data.token;
  }

  async checkAppAccess (username, permissions, personalToken, deviceName?) {
    // TODO: flowtype Permission: streamId/tag, level, defaultName
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
    return {
      permissions: data.checkedPermissions,
      match: data.matchingAccess,
      mismatch: data.mismatchingAccess,
    };
  }

  async createAppAccess (username, permissions, personalToken, appToken?, expireAfter?) {
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
    return res.data.access.token;
  }

  // ---------- REGISTER calls ----------
  async getAvailableHostings () {
    const res = await this.asyncCall(axios.get,
      `${this.register}/hostings`
    );
    return new Hostings().parse(res);
  }

  async createUser (username, password, email, hosting, lang, invitation?, referer?) {
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

  async getUsernameForEmail (email) {
    const res = await this.asyncCall(axios.get,
      `${this.register}/${email}/uid`
    );
    return res.data.uid;
  }

  // ---------- RESET calls ----------
  async requestPasswordReset (username) {
    const res = await this.asyncCall(axios.post,
      `${this.core(username)}/account/request-password-reset`, {
        appId: this.appId,
        username: username,
      }, {
        headers: { Origin: this.origin },
      }
    );
    return res.status;
  }

  async changePassword (username, newPassword, resetToken) {
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
  async getServiceInfo () {
    return this.asyncCall(axios.get,
      `${this.register}/service/info`);
  }

  setErrorHandler (next) {
    this.next = next;
  }

  async asyncCall (fun, ...params) {
    try {
      const res = await fun(...params);
      return res;
    } catch (err) {
      return this.next(JSON.stringify(err));
    }
  }
}

export default Pryv;
