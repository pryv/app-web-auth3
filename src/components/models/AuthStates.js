// @flow

import type {PermissionsList} from './Permissions.js';

export const ACCEPTED_STATUS = 'ACCEPTED';
export const REFUSED_STATUS = 'REFUSED';
export const ERROR_STATUS = 'ERROR';
export const NEED_SIGNIN_STATUS = 'NEED_SIGNIN';

export type AcceptedAuthState = {
  status: 'ACCEPTED';
  username: string;
  token: string;
}

export type RefusedAuthState = {
  status: 'REFUSED';
  reasonId: string;
  message: string;
}

export type ErrorAuthState = {
  status: 'ERROR';
  id: number;
  message: string;
  detail: string;
}

export type NeedSigninState = {
  status: 'NEED_SIGNIN';
  code: number;
  key: string;
  requestingAppId: string;
  requestedPermissions: PermissionsList;
  returnURL: ?string;
  poll_rate_ms: number;
  clientData: ?{};
  url: string;
  lang: string;
  poll: string;
  oauthState: ?string;
}

export type TerminationAuthState = AcceptedAuthState|RefusedAuthState|ErrorAuthState;
export type AuthState = TerminationAuthState|NeedSigninState;
