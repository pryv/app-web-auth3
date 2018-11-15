// @flow

import type Context from '../../../Context.js';
import type {AcceptedAuthState, NeedSigninState} from '../../models/AuthStates.js';
import {ACCEPTED_STATUS, NEED_SIGNIN_STATUS} from '../../models/AuthStates.js';
import closeOrRedirect from './close_or_redirect.js';
import login from './login.js';

async function checkAccess (
  ctx: Context,
  password: string,
  showPermissions: (?string) => void): Promise<void> {
  // Retrieve auth request parameters
  const authState = await ctx.pryv.poll(ctx.pollKey);
  switch (authState.status) {
    case NEED_SIGNIN_STATUS:
      // Auth request is pending
      const needSigninState: NeedSigninState = authState;
      ctx.updateFromAuthState(needSigninState);
      break;
    default:
      // Auth request was already accepted or terminated (error/refused)
      return closeOrRedirect(ctx, authState);
  }
  // Login against Pryv
  await login(ctx, password);

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
  let matchingAccessId = null;
  if (checkApp.permissions) {
    ctx.permissions.updateList(checkApp.permissions);
  }

  // A mismatching access exists, we will update it with the new permissions
  if (checkApp.mismatch) {
    matchingAccessId = checkApp.mismatch.id;
  }

  showPermissions(matchingAccessId);
}

export default checkAccess;
