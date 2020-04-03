// @flow

import type Context from '../../../context.js';
import type {AccessState} from '../../models/AccessStates.js';
import {ACCEPTED_STATUS} from '../../models/AccessStates.js';
import closeOrRedirect from './close_or_redirect.js';
import type { AppCheck } from '../../models/PryvServiceExtension';

async function checkAccess (
  ctx: Context,
  showPermissions: (?string) => void): Promise<void> {
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
  const checkAppResult: AppCheck = await ctx.pryvService.checkAppAccess(
    ctx.user.username,
    ctx.user.personalToken,
    checkData);

  // A matching access exists, returning it alongside with accepted state
  if (checkAppResult.matchingAccess != null) {
    const acceptedState: AccessState = {
      status: ACCEPTED_STATUS,
      username: ctx.user.username,
      token: checkAppResult.matchingAccess.token,
    };
    await ctx.updateAccessState(acceptedState);
    return closeOrRedirect(ctx);
  }

  // replace requested permissions by results
  if (checkAppResult.checkedPermissions != null) {
    ctx.accessState.requestedPermissions = checkAppResult.checkedPermissions;
  }

  // We keep checkAppResult in context for display
  ctx.checkAppResult = checkAppResult;

  // We intentionally do not check for the existence of mismatching access (checkApp.mismatch)
  // If a mismatching access exists, we also want to create a new access anyway.
  // Thus, the mismatching access continue to exist independantly of the new access.

  showPermissions();
}

export default checkAccess;
