// @flow

import type { PermissionsList, ServiceInfos } from './PryvServiceExtension';

export const ACCEPTED_STATUS = 'ACCEPTED';
export const REFUSED_STATUS = 'REFUSED';
export const NEED_SIGNIN_STATUS = 'NEED_SIGNIN';

export type AccessState = {
  // common
  status?: string,

  // status=NEED_SIGNIN
  serviceInfo?: ServiceInfos,
  key?: string,
  requestingAppId?: string,
  requestedPermissions?: PermissionsList,
  returnURL?: string,
  poll_rate_ms?: number,
  clientData?: Object,
  lang?: string,
  poll?: string,
  oauthState?: string,
  expireAfter?: number,
  deviceName?: string,
  referer?: string,

  // status=ACCEPTED
  username?: string,
  token?: string,
  apiEndpoint?: string,

  // status=REFUSED
  reasonId?: string;
  message?: string;

  // status=REDIRECTED (multi-core)
  redirectUrl?: string;
}
