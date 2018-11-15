// @flow

import type Context from '../../../Context.js';
import {AcceptedAuthState} from '../../models/AuthStates.js';
import closeOrRedirect from './close_or_redirect.js';
import login from './login.js';

async function checkAccess (
  ctx: Context,
  password: string,
  showPermissions: (?string) => void): Promise<void> {
  // Login against Pryv
  await login(ctx, password);

  // Check for existing app access
  const checkApp = await ctx.pryv.checkAppAccess(ctx.user.username, ctx.permissions.list, ctx.user.personalToken);

  // A matching access exists, returning it alongside with accepted state
  if (checkApp.match) {
    const acceptedState = new AcceptedAuthState(ctx.user.username, checkApp.match.token);
    await ctx.pryv.updateAuthState(ctx.pollKey, acceptedState);
    return closeOrRedirect(ctx, acceptedState);
  }

  // No such access already exists, we will create a new one with checked permissions
  if (checkApp.permissions) {
    ctx.permissions.updateList(checkApp.permissions);
  }

  // We intentionally do not check for the existence of mismatching access (checkApp.mismatch)
  // If a mismatching access exists, we also want to create a new access anyway.
  // Thus, the mismatching access continue to exist independantly of the new access.

  showPermissions();
}

export default checkAccess;
