import axios from 'axios';
import Hostings from './Hostings.js';

class Pryv {
  constructor (domain, appId, origin) {
    this.core = username => `https://${username}.${domain}`;
    this.register = `https://reg.${domain}`;
    this.appId = appId;
    this.origin = origin;
    this.next = () => {};
  }

  // ---------- AUTH calls ----------

  // GET/reg: polling with according poll key
  async poll (pollKey) {
    return this.asyncCall(axios.get,
      `${this.register}/access/${pollKey}`
    );
  }

  // POST/reg: advertise updated auth state
  async updateAuthState (pollKey, authState) {
    return this.asyncCall(axios.post,
      `${this.register}/access/${pollKey}`,
      authState.body
    );
  }

  // POST/core: login with Pryv credentials
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

  // POST/core: check if requested app access already exists or not,
  // answering with one of the three:
  // 1. checkedPermissions: corrected permissions if the access does not exists yet
  // 2. match: existing access with matching permissions
  // 3. mismatch: existing access with mismatching permissions
  async checkAppAccess (username, permissions, personalToken, deviceName?) {
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

  // POST/core: create a new app access, returns the according app token
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

  // GET/reg: retrieve all available Pryv hostings
  async getAvailableHostings () {
    const res = await this.asyncCall(axios.get,
      `${this.register}/hostings`
    );
    return new Hostings().parse(res.data);
  }

  // POST/reg: create a new Pryv user
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

  // GET/reg: convert email to Pryv username
  async getUsernameForEmail (email) {
    const res = await this.asyncCall(axios.get,
      `${this.register}/${email}/uid`
    );
    return res.data.uid;
  }

  // ---------- RESET calls ----------

  // POST/core: request a password reset
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

  // POST/core: change Pryv password using a reset token
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

  // GET/reg: retrieve service information
  async getServiceInfo () {
    return this.asyncCall(axios.get,
      `${this.register}/service/info`);
  }

  // Attach an error handling function for all async calls
  setErrorHandler (next) {
    this.next = next;
  }

  // Perform async calls using await and try/catch mechanisms
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
