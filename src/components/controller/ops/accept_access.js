// @flow

import {AcceptedAuthState} from '../../models/AuthStates.js';
import closeOrRedirect from './close_or_redirect.js';
import type Context from '../../../context.js';

async function acceptAccess (ctx: Context): Promise<void> {
  // Create a new app access
  const appAccess = await ctx.pryv.createAppAccess(ctx.user.username, ctx.permissions.list, ctx.user.personalToken);

  // Notify register about accepted state
  const acceptedState = new AcceptedAuthState(ctx.user.username, appAccess.token);
  await ctx.pryv.updateAuthState(ctx.pollKey, acceptedState);

  closeOrRedirect(ctx, acceptedState);
}

export default acceptAccess;
