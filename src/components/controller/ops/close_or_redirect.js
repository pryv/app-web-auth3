// @flow

import type Context from '../../../context.js';
import type {TerminationAuthState} from '../../models/AuthStates.js';

function closeOrRedirect (ctx: Context): void {
  let returnUrl = ctx.authState.returnURL;
  // If no return URL was provided, just close the popup
  if (returnUrl == null || returnUrl === 'false' || !returnUrl) {
    window.close();
  } else {
    // Otherwise, we need to redirect to the return URL,
    // passing the resulting parameters as querystring

    if (!returnUrl.endsWith('?')) {
      returnUrl += '?';
    }

    if (ctx.authState.oauthState) { // OK to use pollKey here
      returnUrl += `state=${ctx.authState.oauthState}&code=${ctx.authState.pollKey}&poll=${ctx.pollUrl}`;
    } else {
      returnUrl += `prYvpoll=${ctx.pollUrl}`;
      // the following code should be deprecated 
      for (const [key, val] of Object.entries(ctx.authState)) {
        if (typeof val === 'string' || typeof val === 'number') {
          returnUrl += `&prYv${key}=${val}`;
        }
      }
    }
    location.href = returnUrl;
  }
}

export default closeOrRedirect;
