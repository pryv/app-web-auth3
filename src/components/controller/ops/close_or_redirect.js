// @flow

import type Context from '../../../Context.js';
import type {AuthState} from '../../models/AuthStates.js';

function closeOrRedirect (ctx: Context, state: AuthState): void {
  let returnUrl = ctx.returnURL;
  // If no return URL was provided, just close the popup
  if (returnUrl == null || returnUrl === 'false' || !returnUrl) {
    window.close();
  } else {
    // Otherwise, we need to redirect to the return URL,
    // passing the resulting parameters as querystring
    if (ctx.oauthState) {
      returnUrl += `?state=${ctx.oauthState}&code=${ctx.pollKey}`;
    } else {
      returnUrl += `?prYvkey=${ctx.pollKey}`;

      Object.keys(state).forEach(key => {
        returnUrl += `&prYv${key}=${state[key]}`;
      });
    }
    location.href = returnUrl;
  }
}

export default closeOrRedirect;
