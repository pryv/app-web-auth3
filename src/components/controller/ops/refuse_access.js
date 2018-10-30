// @ flow

import Context from '../../../Context.js';
import {RefusedAuthState} from '../../models/AuthStates.js';
import closeOrRedirect from './close_or_redirect.js';

async function refuseAccess (): void {
  const refusedState = new RefusedAuthState();
  try {
    // Notify register about refused state
    await Context.pryv.updateAuthState(Context.pollKey, refusedState);
  } finally {
    // Close the page anyway (the auth state update may answer 403)
    closeOrRedirect(refusedState);
  }
}

export default refuseAccess;
