// @flow

import {ACCEPTED_STATUS} from '../../models/AccessStates.js';
import type {AcceptedAccessState} from '../../models/AccessStates.js';
import closeOrRedirect from './close_or_redirect.js';
import type Context from '../../../context.js';

async function acceptAccess (ctx: Context): Promise<void> {
  // Create a new app access
  const appAccess = await ctx.pryvService.createAppAccess(
    ctx.user.username,
    ctx.user.personalToken,
    ctx.permissions.list,
    ctx.accessState.requestingAppId,
    ctx.clientData);

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
