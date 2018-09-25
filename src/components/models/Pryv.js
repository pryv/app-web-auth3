import axios from 'axios';
import Hostings from '../controllers/Hostings.js';

class Pryv {
  constructor (domain, appId, origin) {
    this.core = username => `https://${username}.${domain}`;
    this.register = `https://reg.${domain}`;
    this.appId = appId;
    this.origin = origin;
  }

  // ---------- AUTH calls ----------
  async poll (pollKey) {
    return asyncCall(axios.get,
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
    return asyncCall(axios.post,
      `${this.register}/access/${pollKey}`,
      {authState}
    );
  }

  async login (username, password) {
    const [err, res] = await asyncCall(axios.post,
      `${this.core(username)}/auth/login`, {
        username: username,
        password: password,
        appId: this.appId,
      }
    );
    return [err, res.data.token];
  }

  async checkAppAccess (username, permissions, personalToken, deviceName?) {
    // TODO: flowtype Permission: streamId/tag, level, defaultName
    const [err, res] = await asyncCall(axios.post,
      `${this.core(username)}/accesses/check-app`, {
        requestingAppId: this.appId,
        requestedPermissions: permissions,
        deviceName: deviceName,
      }, {
        headers: { Authorization: personalToken },
      }
    );
    const data = res.data;
    return [err, {
      permissions: data.checkedPermissions,
      match: data.matchingAccess,
      mismatch: data.mismatchingAccess,
    }];
  }

  async createAppAccess (username, permissions, personalToken, appToken?, expireAfter?) {
    const [err, res] = await asyncCall(axios.post,
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
    return [err, res.data.token];
  }

  // ---------- REGISTER calls ----------
  async getAvailableHostings () {
    const [err, res] = await asyncCall(axios.get,
      `${this.register}/hostings`
    );
    return [err, new Hostings().parse(res)];
  }

  async createUser (username, password, email, hosting, lang, invitation?, referer?) {
    return asyncCall(axios.post,
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
    const [err, res] = await asyncCall(axios.get,
      `${this.register}/${email}/uid`
    );
    return [err, res.data.uid];
  }

  // ---------- RESET calls ----------
  async requestPasswordReset (username) {
    const [err, res] = await asyncCall(axios.post,
      `${this.core(username)}/account/request-password-reset`, {
        appId: this.appId,
        username: username,
      }, {
        headers: { Origin: this.origin },
      }
    );
    return [err, res.status];
  }

  async changePassword (username, newPassword, resetToken) {
    return asyncCall(axios.post,
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
    return asyncCall(axios.get,
      `${this.register}/service/info`);
  }
}

const asyncCall = async (fun, ...params) => {
  try {
    const res = await fun(...params);
    return [null, res];
  } catch (err) {
    // TODO: improve errors parsing
    return [JSON.stringify(err), null];
  }
};

const asyncCallHandler = (fun) => {
  return async (next, ...params) => {
    try {
      const res = await fun(...params);
      return next(res);
    } catch (err) {
      return next(err);
    }
  };
};

export default Pryv;
