// @flow

import type Context from '../../../Context.js';
import {REFUSED_STATUS} from '../../models/AuthStates.js';
import type {RefusedAuthState} from '../../models/AuthStates.js';
import closeOrRedirect from './close_or_redirect.js';

async function refuseAccess (ctx: Context): Promise<void> {
  const refusedState: RefusedAuthState = {
    status: REFUSED_STATUS,
    reasonId: 'REFUSED_BY_USER',
    message: 'The user refused to give access to the requested permissions',
  };

  try {
    // Notify register about refused state
    await ctx.pryv.updateAuthState(ctx.pollKey, refusedState);
  } finally {
    // Close the page anyway (the auth state update may answer 403)
    closeOrRedirect(ctx, refusedState);
  }
}

export default refuseAccess;
