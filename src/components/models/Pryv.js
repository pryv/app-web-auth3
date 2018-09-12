import axios from 'axios';

class Pryv {
  constructor (core, register, appId, origin) {
    this.core = core;
    this.register = register;
    this.appId = appId;
    this.origin = origin;
  }

  // ---------- AUTH calls ----------
  async poll (pollKey) {
    const res = await axios.get(
      `${this.register}/access/${pollKey}`
    );
    return res;
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
    const res = await axios.post(
      `${this.register}/access/${pollKey}`,
      {authState}
    );
    return res;
  }

  async login (username, password) {
    const res = await axios.post(
      `${username}.${this.core}/auth/login`, {
        username: username,
        password: password,
        appId: this.appId,
      }
    );
    return res;
  }

  async checkAppAccess (username, permissions, personalToken, deviceName?) {
    // TODO: flowtype Permission: streamId/tag, level, defaultName
    const res = await axios.post(
      `${username}.${this.core}/access/check-app`, {
        requestingAppId: this.appId,
        requestedPermissions: permissions,
        deviceName: deviceName,
      }, {
        headers: { Authorization: personalToken },
      }
    );
    return res;
  }

  async createAppAccess (username, permissions, personalToken, appToken?, expireAfter?) {
    const res = await axios.post(
      `${username}.${this.core}/accesses`, {
        name: this.appId,
        type: 'app',
        permissions: permissions,
        token: appToken,
        expireAfter: expireAfter,
      }, {
        headers: { Authorization: personalToken },
      }
    );
    return res;
  }

  // ---------- REGISTER calls ----------
  async getAvailableHostings () {
    const res = await axios.get(
      `${this.register}/hostings`
    );
    return res;
  }

  async createUser (username, password, email, lang, hosting, invitation?, referer?) {
    const res = await axios.post(
      `${this.register}/user`, {
        appid: this.appId,
        username: username,
        password: password,
        email: email,
        hosting: hosting,
        languageCode: lang,
        invitationtoken: invitation || 'enjoy',
        referer: referer,
      }
    );
    return res;
  }

  async getUsernameForEmail (email) {
    const res = await axios.get(
      `${this.register}/${email}/uid`
    );
    return res;
  }
  // ---------- RESET calls ----------
  async requestPasswordReset (username) {
    const res = await axios.post(
      `${username}.${this.core}/account/request-password-reset`, {
        appId: this.appId,
        username: username,
      }, {
        headers: { Origin: this.origin },
      }
    );
    return res;
  }

  async changePassword (username, newPassword, resetToken) {
    const res = await axios.post(
      `${username}.${this.core}/account/reset-password`, {
        username: username,
        password: newPassword,
        appId: this.appId,
        resetToken: resetToken,
      }, {
        headers: { Origin: this.origin },
      }
    );
    return res;
  }

  // ---------- UTILS calls ----------
  async getServiceInfo () {
    const res = await axios.get(
      `${this.register}/service/info`);
    return res;
  }
}

export default Pryv;
