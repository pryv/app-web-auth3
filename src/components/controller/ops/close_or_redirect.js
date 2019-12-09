// @flow

import type Context from '../../../context.js';
import type {TerminationAuthState} from '../../models/AuthStates.js';

function closeOrRedirect (ctx: Context, state: TerminationAuthState): void {
  let returnUrl = ctx.returnURL;
  // If no return URL was provided, just close the popup
  if (returnUrl == null || returnUrl === 'false' || !returnUrl) {
    window.close();
  } else {
    // Otherwise, we need to redirect to the return URL,
    // passing the resulting parameters as querystring

    if (!returnUrl.endsWith('?')) {
      returnUrl += '?';
    }

    if (ctx.oauthState) {
      returnUrl += `state=${ctx.oauthState}&code=${ctx.pollKey}`;
    } else {
      returnUrl += `prYvkey=${ctx.pollKey}`;

      for (const [key, val] of Object.entries(state)) {
        if (typeof val === 'string' || typeof val === 'number') {
          returnUrl += `&prYv${key}=${val}`;
        }
      }
    }
    location.href = returnUrl;
  }
}

export default closeOrRedirect;
