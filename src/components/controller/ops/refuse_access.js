// @flow

import type Context from '../../../Context.js';
import {RefusedAuthState} from '../../models/AuthStates.js';
import closeOrRedirect from './close_or_redirect.js';

async function refuseAccess (ctx: Context): Promise<void> {
  const refusedState = new RefusedAuthState();
  try {
    // Notify register about refused state
    await ctx.pryv.updateAuthState(ctx.pollKey, refusedState);
  } finally {
    // Close the page anyway (the auth state update may answer 403)
    closeOrRedirect(ctx, refusedState);
  }
}

export default refuseAccess;
