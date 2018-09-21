import axios from 'axios';

class Pryv {
  constructor (domain, appId, origin) {
    this.core = username => `https://${username}.${domain}`;
    this.register = `https://reg.${domain}`;
    this.appId = appId;
    this.origin = origin;
  }

  // ---------- AUTH calls ----------
  poll (pollKey) {
    return axios.get(
      `${this.register}/access/${pollKey}`
    );
  }

  updateAuthState (pollKey, authState) {
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
    return axios.post(
      `${this.register}/access/${pollKey}`,
      {authState}
    );
  }

  async login (username, password) {
    const res = await axios.post(
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
    return [data.checkedPermissions, data.matchingAccess, data.mismatchingAccess];
  }

  async createAppAccess (username, permissions, personalToken, appToken?, expireAfter?) {
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
    return res.data.token;
  }

  // ---------- REGISTER calls ----------
  getAvailableHostings () {
    return axios.get(
      `${this.register}/hostings`
    );
  }

  createUser (username, password, email, hosting, lang, invitation?, referer?) {
    return axios.post(
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
    const res = await axios.get(
      `${this.register}/${email}/uid`
    );
    return res.data.uid;
  }

  // ---------- RESET calls ----------
  requestPasswordReset (username) {
    return axios.post(
      `${this.core(username)}/account/request-password-reset`, {
        appId: this.appId,
        username: username,
      }, {
        headers: { Origin: this.origin },
      }
    );
  }

  changePassword (username, newPassword, resetToken) {
    return axios.post(
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
  getServiceInfo () {
    return axios.get(
      `${this.register}/service/info`);
  }
}

export default Pryv;
