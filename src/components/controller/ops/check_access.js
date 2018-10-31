// @ flow

import Context from '../../../Context.js';
import {AcceptedAuthState} from '../../models/AuthStates.js';
import type PermissionsList from '../../../models/Permissions.js';
import closeOrRedirect from './close_or_redirect.js';

async function checkAccess (
  username: string,
  personalToken: string,
  cb: (permissions: PermissionsList) => void): void {
  // Check for existing app access
  const checkApp = await Context.pryv.checkAppAccess(username, Context.permissions.list, personalToken);

  // A matching access exists, returning it alongside with accepted state
  if (checkApp.match) {
    const acceptedState = new AcceptedAuthState(username, checkApp.match.token);
    await Context.pryv.updateAuthState(Context.pollKey, acceptedState);
    return closeOrRedirect(acceptedState);
  }

  // No such access already exists, we will create a new one with checked permissions
  let matchingAccessId = null;
  if (checkApp.permissions) {
    Context.permissions.updateList(checkApp.permissions);
  }

  // A mismatching access exists, we will update it with the new permissions
  if (checkApp.mismatch) {
    matchingAccessId = checkApp.mismatch.id;
  }

  cb(Context.permissions.list, matchingAccessId);
}

export default checkAccess;
