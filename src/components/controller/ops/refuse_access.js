// @flow

import type Context from '../../../context.js';
import {REFUSED_STATUS} from '../../models/AccessStates.js';
import type {AccessState} from '../../models/AccessStates.js';
import closeOrRedirect from './close_or_redirect.js';

async function refuseAccess (ctx: Context): Promise<void> {
  const refusedState: AccessState = {
    status: REFUSED_STATUS,
    reasonId: 'REFUSED_BY_USER',
    message: 'The user refused to give access to the requested permissions',
  };

  try {
    // Notify register about refused state
    await ctx.updateAccessState(refusedState);
  } finally {
    // Close the page anyway (the auth state update may answer 403)
    closeOrRedirect(ctx);
  }
}

export default refuseAccess;
