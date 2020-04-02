// @flow

import type { PermissionsList } from '../models/PryvServiceExtension';

export const ACCEPTED_STATUS = 'ACCEPTED';
export const REFUSED_STATUS = 'REFUSED';
export const ERROR_STATUS = 'ERROR';
export const NEED_SIGNIN_STATUS = 'NEED_SIGNIN';

export type AcceptedAccessState = {
  status: 'ACCEPTED',
  username: string,
  token: string,
  apiEndpoint: string,
}

export type RefusedAccessState = {
  status: 'REFUSED';
  reasonId: string;
  message: string;
  serviceInfo: string;
}

export type ErrorAccessState = {
  status: 'ERROR';
  id: number;
  message: string;
  detail: string;
  serviceInfo: string;
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
  expireAfter: ?number;
  url: string;
  lang: string;
  poll: string;
  oaccessState: ?string;
  serviceInfo: string;
}

export type TerminationAccessState = AcceptedAccessState|RefusedAccessState|ErrorAccessState;
export type AccessState = TerminationAccessState|NeedSigninState;
