// @flow

import {ACCEPTED_STATUS} from '../../models/AuthStates.js';
import type {AcceptedAuthState} from '../../models/AuthStates.js';
import closeOrRedirect from './close_or_redirect.js';
import type Context from '../../../context.js';

async function acceptAccess (
  ctx: Context,
  updateId: ?string): Promise<void> {
  let appAccess;

  if (updateId != null) {
    // Update existing app access
    appAccess = await ctx.pryv.updateAppAccess(
      updateId,
      ctx.user.username,
      ctx.user.personalToken,
      ctx.permissions.list,
      ctx.clientData);
  } else {
    // Create a new app access
    appAccess = await ctx.pryv.createAppAccess(
      ctx.user.username,
      ctx.user.personalToken,
      ctx.permissions.list,
      ctx.clientData);
  }

  // Notify register about accepted state
  const acceptedState: AcceptedAuthState = {
    status: ACCEPTED_STATUS,
    username: ctx.user.username,
    token: appAccess.token,
  };
  await ctx.pryv.updateAuthState(ctx.pollKey, acceptedState);

  closeOrRedirect(ctx, acceptedState);
}

export default acceptAccess;
