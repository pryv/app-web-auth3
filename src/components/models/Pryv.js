import axios from 'axios';

class Pryv {
  constructor (domain, username, appId, origin) {
    this.core = `https://${username}.${domain}`;
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

  login (username, password) {
    return axios.post(
      `${this.core}/auth/login`, {
        username: username,
        password: password,
        appId: this.appId,
      }
    );
  }

  checkAppAccess (username, permissions, personalToken, deviceName?) {
    // TODO: flowtype Permission: streamId/tag, level, defaultName
    return axios.post(
      `${this.core}/access/check-app`, {
        requestingAppId: this.appId,
        requestedPermissions: permissions,
        deviceName: deviceName,
      }, {
        headers: { Authorization: personalToken },
      }
    );
  }

  createAppAccess (username, permissions, personalToken, appToken?, expireAfter?) {
    return axios.post(
      `${this.core}/accesses`, {
        name: this.appId,
        type: 'app',
        permissions: permissions,
        token: appToken,
        expireAfter: expireAfter,
      }, {
        headers: { Authorization: personalToken },
      }
    );
  }

  // ---------- REGISTER calls ----------
  getAvailableHostings () {
    return axios.get(
      `${this.register}/hostings`
    );
  }

  createUser (username, password, email, lang, hosting, invitation?, referer?) {
    return axios.post(
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
  }

  getUsernameForEmail (email) {
    return axios.get(
      `${this.register}/${email}/uid`
    );
  }
  // ---------- RESET calls ----------
  requestPasswordReset (username) {
    return axios.post(
      `${this.core}/account/request-password-reset`, {
        appId: this.appId,
        username: username,
      }, {
        headers: { Origin: this.origin },
      }
    );
  }

  changePassword (username, newPassword, resetToken) {
    return axios.post(
      `${this.core}/account/reset-password`, {
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
