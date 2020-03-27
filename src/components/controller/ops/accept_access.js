// @flow

import {ACCEPTED_STATUS} from '../../models/AuthStates.js';
import type {AcceptedAuthState} from '../../models/AuthStates.js';
import closeOrRedirect from './close_or_redirect.js';
import type Context from '../../../context.js';

async function acceptAccess (ctx: Context): Promise<void> {
  // Create a new app access
  const appAccess = await ctx.pryv.createAppAccess(
    ctx.user.username,
    ctx.user.personalToken,
    ctx.permissions.list,
    ctx.authState.requestingAppId,
    ctx.clientData);

  // Notify register about accepted state
  const acceptedState: AcceptedAuthState = {
    status: ACCEPTED_STATUS,
    username: ctx.user.username, // to be deprecated
    token: appAccess.token, // to be deprecated
    apiEndpoint: ctx.pryv.pryvService.apiEndpointFor(ctx.user.username, appAccess.token),
  };

  await ctx.updateAuthState(acceptedState);
  closeOrRedirect(ctx);
}

export default acceptAccess;
