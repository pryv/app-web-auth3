import axios from 'axios';

class APIcalls {
  constructor (core, register) {
    this.core = core;
    this.register = register;
  }

  // ---------- AUTH calls ----------
  async updateAuthState (pollKey, authState) {
    // TODO: flowtype authState:
    // authStatus, user, token, lang
    const res = await axios.post(
      `${this.register}/access/${pollKey}`,
      {authState}
    );
    return res;
  }

  async pryvLogin (username, password) {
    const res = await axios.post(
      `${this.core}/auth/login`, {
        username: username,
        password: password
      }
    );
    return res;
  }

  async checkAppAccess (appId, permissions) {
    const res = await axios.post(
      `${this.core}/access/check-app`, {
        appId: appId,
        permissions: permissions
      }
    );
    return res;
  }

  async createAppAccess (appId, permissions) {
    const res = await axios.post(
      `${this.core}/accesses`, {
        appId: appId,
        type: 'app',
        permissions: permissions
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

  async createUser (appId, username, password, email, lang, hosting) {
    const res = await axios.post(
      `${this.register}/user`, {
        appId: appId,
        username: username,
        password: password,
        email: email,
        lang: lang,
        invitationToken: 'enjoy'
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
  async requestPasswordReset (appId, username) {
    const res = await axios.post(
      `${this.core}/account/request-password-reset`, {
        appId: appId,
        username: username
      }
    );
    return res;
  }

  async changePassword (username, newPassword, appId, resetToken) {
    const res = await axios.post(
      `${this.core}/account/reset-password`, {
        username: username,
        password: newPassword,
        appId: appId,
        resetToken: resetToken
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

export default APIcalls;
