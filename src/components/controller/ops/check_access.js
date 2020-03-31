// @flow

import type Context from '../../../context.js';
import type {AcceptedAccessState} from '../../models/AccessStates.js';
import {ACCEPTED_STATUS} from '../../models/AccessStates.js';
import closeOrRedirect from './close_or_redirect.js';

async function checkAccess (
  ctx: Context,
  showPermissions: (?string) => void): Promise<void> {
  console.log(ctx.accessState);
    const checkData = { };
    [
      'requestingAppId',
      'requestedPermissions',
      'deviceName',
      'token',
      'expireAfter',
      'clientData',
    ].forEach((key) => {
      if (typeof ctx.accessState[key] !== 'undefined') {
        checkData[key] = ctx.accessState[key];
      }
    });

  // Check for existing app access
  const checkAppResult = await ctx.pryvService.checkAppAccess(
    ctx.user.username,
    ctx.user.personalToken,
    checkData);

  // A matching access exists, returning it alongside with accepted state
  if (checkAppResult.matchingAccess) {
    const acceptedState: AcceptedAccessState = {
      status: ACCEPTED_STATUS,
      username: ctx.user.username,
      token: checkAppResult.matchingAccess.token,
    };
    await ctx.updateAccessState(acceptedState);
    return closeOrRedirect(ctx);
  }
  
  // We keep checkAppResult in context for display
  ctx.checkAppResult = checkAppResult;

  // We intentionally do not check for the existence of mismatching access (checkApp.mismatch)
  // If a mismatching access exists, we also want to create a new access anyway.
  // Thus, the mismatching access continue to exist independantly of the new access.

  showPermissions();
}

export default checkAccess;
