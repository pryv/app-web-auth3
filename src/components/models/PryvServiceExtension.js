// @flow

import Pryv from 'pryv';
import Hostings from './Hostings.js';
const url = require('url');

type Permission = {
  streamId: string,
  level: 'read' | 'contribute' | 'manage',
  defaultName: ?string,
  name: ?string,
};

export type PermissionsList = Array<Permission>;

type AppAccess = {
  type: 'app',
  permissions: PermissionsList,
  expires: ?number,
  token: string,
};

export type AppCheck = {
  checkedPermissions: PermissionsList,
  matchingAccess: AppAccess,
  mismatchingAccess: AppAccess,
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

Pryv.Service.prototype.apiEndpointForSync = function apiEndpointForSync (username, token) {
  return Pryv.Service.buildAPIEndpoint(this.infoSync(), username, token);
};

// POST/core: perform MFA challenge
Pryv.Service.prototype.mfaChallenge = async function mfaChallenge (username: string, mfaToken: string): Promise<void> {
  await Pryv.utils.superagent
    .post(this.apiEndpointForSync(username) + 'mfa/challenge')
    .set('accept', 'json')
    .set('Authorization', mfaToken)
    .send({});
};

// POST/core: verify MFA challenge
Pryv.Service.prototype.mfaVerify = async function mfaVerify (username: string, mfaToken: string, code: string): Promise<string> {
  const res = await Pryv.utils.superagent
    .post(this.apiEndpointForSync(username) + 'mfa/verify')
    .set('accept', 'json')
    .set('Authorization', mfaToken)
    .send({ code: code });
  return res.body.token;
};

// POST/core: check if requested app access already exists or not,
// answering with one of the three:
// 1. checkedPermissions: corrected permissions if the access does not exist yet
// 2. match: existing access with matching permissions
// 3. mismatch: existing access with mismatching permissions
Pryv.Service.prototype.checkAppAccess = async function checkAppAccess (username: string,
  personalToken: string, checkAppData: Object): Promise<AppCheck> {
  const res = await Pryv.utils.superagent
    .post(this.apiEndpointForSync(username) + 'accesses/check-app')
    .set('accept', 'json')
    .set('Authorization', personalToken)
    .send(checkAppData);
  return res.body;
};

// POST/core: create a new app access, returns the according app token
Pryv.Service.prototype.createAppAccess = async function createAppAccess (
  username: string, personalToken: string,
  requestData: Object): Promise<AppAccess> {
  const res = await Pryv.utils.superagent
    .post(this.apiEndpointForSync(username) + 'accesses')
    .set('accept', 'json')
    .set('Authorization', personalToken)
    .send(requestData);
  return res.body.access;
};

// POST/core: delete an new  access
Pryv.Service.prototype.deleteAppAccess = async function deleteAppAccess (
  username: string, personalToken: string,
  accessId: string): Promise<AppAccess> {
  const res = await Pryv.utils.superagent
    .delete(this.apiEndpointForSync(username) + 'accesses/' + accessId)
    .set('accept', 'json')
    .set('Authorization', personalToken)
    .send({id: accessId});
  return res.body.accessDeletion;
};

// ---------- REGISTER calls ----------
function isFirstVersionIsEqualOrHigher (version1, version2) {
  const version1parts = version1.split('.');
  const version2parts = version2.split('.');
  // TODO - handle opensource version too

  for (let i = 0; i < version1parts.length; ++i) {
    // if the versions match, continue
    if (version1parts[i] === version2parts[i]) {
      // if the cycle reached the last minor version
      if (version2parts.length === (i + 1)) {
        return true;
      } else {
        continue;
      }
    } else if (version1parts[i] > version2parts[i]) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

// GET/reg: retrieve all available Pryv hostings
Pryv.Service.prototype.getAvailableHostings = async function getAvailableHostings (): Promise<Hostings> {
  const res = await Pryv.utils.superagent
    .get(this.infoSync().register + 'hostings')
    .set('accept', 'json');
  return new Hostings(res.body);
};

// POST/reg: create a new Pryv user
Pryv.Service.prototype.createUser = async function createUser (
  availableCore: string,
  username: string,
  password: string, email: string,
  hosting: string, lang: string, appId: string,
  invitation: ?string, referer: ?string): Promise<NewUser> {
  const platformVersion = this.infoSync().version;
  let res;
  if (platformVersion && isFirstVersionIsEqualOrHigher(platformVersion, '1.6.0')) {
    res = await Pryv.utils.superagent
      .post(url.resolve(availableCore, 'users'))
      .set('accept', 'json')
      .send({
        appId: appId,
        username: username,
        password: password,
        email: email,
        hosting: hosting,
        language: lang || 'en',
        invitationToken: invitation || 'enjoy',
        referer: referer,
      });
  } else {
    res = await Pryv.utils.superagent
      .post(this.infoSync().register + 'user')
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
  }

  return res.body;
};

Pryv.Service.prototype.checkUsernameExistence = async function checkUsernameExistence (username: string): Promise<string> {
  const res = await Pryv.utils.superagent
    .post(this.infoSync().register + username + '/server')
    .set('accept', 'json').send({});
  return res.body.server;
};

// GET/reg: convert email to Pryv username
Pryv.Service.prototype.getUsernameForEmail = async function getUsernameForEmail (usernameOrEmail: string): Promise<string> {
  if (usernameOrEmail.search('@') < 0) {
    return usernameOrEmail;
  }
  const res = await Pryv.utils.superagent
    .get(this.infoSync().register + usernameOrEmail + '/uid')
    .set('accept', 'json');
  return res.body.uid;
};

// ---------- RESET calls ----------

// POST/core: request a password reset
Pryv.Service.prototype.requestPasswordReset = async function requestPasswordReset (username: string, appId: string): Promise<number> {
  const res = await Pryv.utils.superagent
    .post(this.apiEndpointForSync(username) + 'account/request-password-reset')
    .set('accept', 'json')
    .send({
      appId: appId,
      username: username,
    });
  return res.status;
};

// POST/core: change Pryv password using a reset token
Pryv.Service.prototype.resetPassword = async function resetPassword (username: string,
  newPassword: string,
  resetToken: string,
  appId: string): Promise<number> {
  const res = await Pryv.utils.superagent
    .post(this.apiEndpointForSync(username) + 'account/reset-password')
    .set('accept', 'json')
    .send({
      username: username,
      newPassword: newPassword,
      appId: appId,
      resetToken: resetToken,
    });
  return res.status;
};

Pryv.Service.prototype.changePassword = async function changePassword (
  username: string,
  oldPassword: string,
  newPassword: string,
  personalToken: string) {
  const res = await Pryv.utils.superagent
    .post(this.apiEndpointForSync(username) + 'account/change-password')
    .set('accept', 'json')
    .set('Authorization', personalToken)
    .send({
      oldPassword: oldPassword,
      newPassword: newPassword,
    });
  return res.status;
};

Pryv.Service.prototype.loginWithThrow = async function loginWithThrow (username, password, appId, originHeader) {
  const apiEndpoint = await this.apiEndpointFor(username);

  try {
    const headers: any = { accept: 'json' };
    originHeader = originHeader || (await this.info()).register;
    if (!Pryv.utils.isBrowser()) {
      headers.Origin = originHeader;
    }
    const res = await Pryv.utils.superagent.post(apiEndpoint + 'auth/login')
      .set(headers)
      .send({ username: username, password: password, appId: appId });

    if (!res.body.token) {
      throw new Error('Invalid login response: ' + res.body);
    }
    return new Pryv.Connection(
      Pryv.Service.buildAPIEndpoint(
        await this.info(),
        username,
        res.body.token),
      this // Pre load Connection with service
    );
  } catch (e) {
    if (e.response && e.response.body && e.response.body) {
      const errBody = e.response.body;
      if (errBody.error && errBody.error.message) {
        throw new Error(errBody.error.message);
      }
      if (errBody.mfaToken) {
        const e: any = new Error();
        e.mfaToken = errBody.mfaToken;
        throw e;
      }
    }
  }
};
