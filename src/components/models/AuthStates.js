// @flow

import Permissions from './Permissions.js';

const ACCEPTED_STATUS = 'ACCEPTED';
const REFUSED_STATUS = 'REFUSED';
const ERROR_STATUS = 'ERROR';
const NEED_SIGNIN_STATUS = 'NEED_SIGNIN';

export class AcceptedAuthState {
  body : {
    status: string,
    username: string,
    token: string,
  }

  constructor (username: string, token: string) {
    this.body = {
      status: ACCEPTED_STATUS,
      username: username,
      token: token,
    };
  }
}

export class RefusedAuthState {
  body: {
    status: string,
    reasonId: string,
    message: string,
  }

  constructor (reasonId: ?string, message: ?string) {
    this.body = {
      status: REFUSED_STATUS,
      reasonId: reasonId || 'REFUSED_BY_USER',
      message: message || 'The user refused to give access to the requested permissions',
    };
  }
}

export class ErrorAuthState {
  body: {
    status: string,
    id: number,
    message: string,
    detail: string,
  }

  constructor (id: number, message: string, detail: string) {
    this.body = {
      status: ERROR_STATUS,
      id: id,
      message: message,
      detail: detail,
    };
  }
}

export class NeedSigninState {
  body: {
    status: string,
    code: number,
    pollKey: string,
    appId: string,
    permissions: Permissions,
    returnUrl: string,
    oauthState: string,
    pollRateMs: number,
  }

  constructor (data: Object) {
    this.body = {
      status: NEED_SIGNIN_STATUS,
      code: data.code,
      pollKey: data.key,
      appId: data.requestingAppId,
      permissions: new Permissions(data.requestedPermissions),
      returnUrl: data.returnUrl,
      oauthState: data.oauthState,
      pollRateMs: data.poll_rate_ms,
    };
  }
}

export type AuthState = AcceptedAuthState|RefusedAuthState|ErrorAuthState|NeedSigninState;
