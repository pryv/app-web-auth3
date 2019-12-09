// @flow

import type Context from '../../../context.js';
import type {AcceptedAuthState} from '../../models/AuthStates.js';
import {ACCEPTED_STATUS} from '../../models/AuthStates.js';
import closeOrRedirect from './close_or_redirect.js';

async function checkAccess (
  ctx: Context,
  showPermissions: (?string) => void): Promise<void> {
  // Check for existing app access
  const checkApp = await ctx.pryv.checkAppAccess(
    ctx.user.username,
    ctx.permissions.list,
    ctx.user.personalToken,
    ctx.requestingAppId);

  // A matching access exists, returning it alongside with accepted state
  if (checkApp.match) {
    const acceptedState: AcceptedAuthState = {
      status: ACCEPTED_STATUS,
      username: ctx.user.username,
      token: checkApp.match.token,
    };
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
