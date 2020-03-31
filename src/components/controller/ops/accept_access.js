// @flow

import { ACCEPTED_STATUS } from '../../models/AccessStates.js';
import type { AcceptedAccessState } from '../../models/AccessStates.js';
import closeOrRedirect from './close_or_redirect.js';
import type Context from '../../../context.js';

async function acceptAccess (ctx: Context): Promise<void> {
  // Create a new app access

  const requestData = {
    permissions: ctx.checkAppResult.checkedPermissions,
    name: ctx.accessState.requestingAppId,
    type: 'app',
  };
  console.log(ctx.accessState);
  // optionals
  [
    'deviceName',
    'token',
    'expireAfter',
    'clientData',
  ].forEach((key) => {
    if (typeof ctx.accessState[key] !== 'undefined') {
      requestData[key] = ctx.accessState[key];
    }
  });

  const appAccess = await ctx.pryvService.createAppAccess(
    ctx.user.username,
    ctx.user.personalToken,
    requestData);

  // Notify register about accepted state
  const acceptedState: AcceptedAccessState = {
    status: ACCEPTED_STATUS,
    username: ctx.user.username, // to be deprecated
    token: appAccess.token, // to be deprecated
    apiEndpoint: ctx.pryvService.apiEndpointForSync(ctx.user.username, appAccess.token),
  };

  await ctx.updateAccessState(acceptedState);
  closeOrRedirect(ctx);
}

export default acceptAccess;
