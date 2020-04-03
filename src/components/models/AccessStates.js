// @flow

import type { PermissionsList } from '../models/PryvServiceExtension';

export const ACCEPTED_STATUS = 'ACCEPTED';
export const REFUSED_STATUS = 'REFUSED';
export const NEED_SIGNIN_STATUS = 'NEED_SIGNIN';

export type AccessState = {
  // common
  status: string,

  // status=NEED_SIGNIN
  serviceInfo?: Object,
  code?: number,
  key?: string,
  requestingAppId?: string,
  requestedPermissions?: PermissionsList,
  returnURL?: string,
  poll_rate_ms?: number,
  clientData?: Object,
  expireAfter?: number,
  url?: string,
  lang?: string,
  poll?: string,
  oaccessState?: string,

  // status=ACCEPTED
  username?: string,
  token?: string,
  apiEndpoint?: string,

  // status=REFUSED
  reasonId?: string;
  message?: string;
}
