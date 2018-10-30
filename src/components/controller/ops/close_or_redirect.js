// @ flow

import Context from '../../../Context.js';
import type {AuthState} from '../../models/AuthStates.js';

function closeOrRedirect (state: AuthState): void {
  let href = Context.returnURL;
  // If no return URL was provided, just close the popup
  if (href == null || href === 'false') {
    window.close();
  } else {
    // Otherwise, we need to redirect to the return URL,
    // passing the resulting parameters as querystring
    if (Context.oauthState) {
      href += `?state=${Context.oauthState}&code=${Context.pollKey}`;
    } else {
      href += `?prYvkey=${Context.pollKey}`;

      Object.keys(state.body).forEach(key => {
        href += `&prYv${key}=${state.body[key]}`;
      });
    }
    location.href = href;
  }
}

export default closeOrRedirect;
