// @ flow

import Context from '../../../Context.js';
import {AcceptedAuthState} from '../../models/AuthStates.js';
import type PermissionsList from '../../../models/Permissions.js';
import closeOrRedirect from './close_or_redirect.js';

async function checkAccess (
  username: string,
  personalToken: string,
  newAccessCb: (permissions: PermissionsList) => void): void {
  // Check for existing app access
  const checkApp = await Context.pryv.checkAppAccess(username, Context.permissions.list, personalToken);

  // A mismatching access exists, throw an error for now
  if (checkApp.mismatch) {
    throw new Error('Mismatching access already exists: ' + JSON.stringify(checkApp.mismatch));
  }

  // A matching access exists, returning it alongside with accepted state
  if (checkApp.match) {
    const acceptedState = new AcceptedAuthState(username, checkApp.match.token);
    await Context.pryv.updateAuthState(Context.pollKey, acceptedState);
    return closeOrRedirect(acceptedState);
  }

  // No such access already exists, returning checked permissions
  if (checkApp.permissions) {
    const permissionsList = Context.permissions.updateList(checkApp.permissions);
    return newAccessCb(permissionsList);
  }
}

export default checkAccess;
