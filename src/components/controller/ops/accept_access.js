// @ flow

import Context from '../../../Context.js';
import {AcceptedAuthState} from '../../models/AuthStates.js';
import type PermissionsList from '../../../models/Permissions.js';
import closeOrRedirect from './close_or_redirect.js';

async function acceptAccess (
  username: string,
  permissions: PermissionsList,
  personalToken: string): void {
  // Create a new app access
  const appAccess = await Context.pryv.createAppAccess(username, permissions, personalToken);

  // Notify register about accepted state
  const acceptedState = new AcceptedAuthState(username, appAccess.token);
  await Context.pryv.updateAuthState(Context.pollKey, acceptedState);

  closeOrRedirect(acceptedState);
}

export default acceptAccess;
