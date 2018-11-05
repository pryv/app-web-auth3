// @ flow

import {AcceptedAuthState} from '../../models/AuthStates.js';
import type PermissionsList from '../../../models/Permissions.js';
import closeOrRedirect from './close_or_redirect.js';
import type Context from '../../../context.js';

async function acceptAccess (
  ctx: Context,
  username: string,
  permissions: PermissionsList,
  personalToken: string,
  updateId: ?string): void {
  let appAccess;

  if (updateId != null) {
    // Update existing app access
    appAccess = await ctx.pryv.updateAppAccess(updateId, username, permissions, personalToken);
  } else {
    // Create a new app access
    appAccess = await ctx.pryv.createAppAccess(username, permissions, personalToken);
  }

  // Notify register about accepted state
  const acceptedState = new AcceptedAuthState(username, appAccess.token);
  await ctx.pryv.updateAuthState(ctx.pollKey, acceptedState);

  closeOrRedirect(ctx, acceptedState);
}

export default acceptAccess;
