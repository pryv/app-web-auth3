// @flow

import { ACCEPTED_STATUS } from '../../models/AccessStates.js';
import type { AccessState } from '../../models/AccessStates.js';
import closeOrRedirect from './close_or_redirect.js';
import type Context from '../../../context.js';

async function acceptAccess (ctx: Context): Promise<void> {
  // Create a new app access

  // we need to delete a previous access first
  if (ctx.checkAppResult.mismatchingAccess) {
    const deleteAction = await ctx.pryvService.deleteAppAccess(
      ctx.user.username,
      ctx.user.personalToken,
      ctx.checkAppResult.mismatchingAccess.id);
    if (!deleteAction.id) {
      throw new Error('Failed removing existing access');
    }
  }

  const requestData = {
    permissions: ctx.checkAppResult.checkedPermissions,
    name: ctx.accessState.requestingAppId,
    type: 'app',
  };
  // optionals
  [
    'deviceName',
    'token',
    'expireAfter',
    'clientData',
  ].forEach((key: string) => {
    if (typeof ctx.accessState[key] !== 'undefined') {
      requestData[key] = ctx.accessState[key];
    }
  });

  const appAccess = await ctx.pryvService.createAppAccess(
    ctx.user.username,
    ctx.user.personalToken,
    requestData);

  // Notify register about accepted state
  const acceptedState: AccessState = {
    status: ACCEPTED_STATUS,
    // TODO use apiEndpoint field as well (keep username/token for older register versions)
    apiEndpoint: ctx.pryvService.apiEndpointForSync(ctx.user.username, appAccess.token),
    username: ctx.user.username, // to be deprecated
    token: appAccess.token, // to be deprecated
  };

  await ctx.updateAccessState(acceptedState);
  closeOrRedirect(ctx);
}

export default acceptAccess;
