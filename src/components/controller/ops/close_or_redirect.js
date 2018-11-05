// @ flow

import type Context from '../../../Context.js';
import type {AuthState} from '../../models/AuthStates.js';

function closeOrRedirect (ctx: Context, state: AuthState): void {
  let href = ctx.returnURL;
  // If no return URL was provided, just close the popup
  if (href == null || href === 'false') {
    window.close();
  } else {
    // Otherwise, we need to redirect to the return URL,
    // passing the resulting parameters as querystring
    if (ctx.oauthState) {
      href += `?state=${ctx.oauthState}&code=${ctx.pollKey}`;
    } else {
      href += `?prYvkey=${ctx.pollKey}`;

      Object.keys(state.body).forEach(key => {
        href += `&prYv${key}=${state.body[key]}`;
      });
    }
    location.href = href;
  }
}

export default closeOrRedirect;
