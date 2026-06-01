// @flow

import type Context from '../../../context.js';

function closeOrRedirect (ctx: Context): void {
  // Headless caller (CLI) — no popup to close, no parent window to redirect.
  // Render a terminal "you can close this window" message and stop.
  if (ctx.cli) {
    renderCliTerminalMessage();
    return;
  }

  // Multi-core auth handoff: the access moved to a different core; the
  // auth UI follows the new poll URL rather than completing here.
  if (ctx.accessState.status === 'REDIRECTED' && ctx.accessState.redirectUrl) {
    location.href = ctx.accessState.redirectUrl;
    return;
  }

  let returnUrl = ctx.accessState.returnURL;
  // If no return URL was provided, just close the popup
  if (returnUrl == null || returnUrl === 'false' || !returnUrl) {
    window.close();
  } else {
    // Otherwise, we need to redirect to the return URL,
    // passing the resulting parameters as querystring

    if (!returnUrl.endsWith('?')) {
      returnUrl += '?';
    }

    if (ctx.accessState.oauthState) {
      let codeParam = '';
      if (ctx.accessState.key) {
        codeParam = `&code=${ctx.accessState.key}`;
      }
      returnUrl += `state=${ctx.accessState.oauthState}${codeParam}&poll=${ctx.pollUrl}`;
    } else {
      returnUrl += `prYvpoll=${ctx.pollUrl}`;
      // the following code should be deprecated
      for (const [key, val] of Object.entries(ctx.accessState)) {
        if (typeof val === 'string' || typeof val === 'number') {
          returnUrl += `&prYv${key}=${val}`;
        }
      }
    }
    location.href = returnUrl;
  }
}

function renderCliTerminalMessage (): void {
  const message = 'You\'re successfully logged in, you can close this window.';
  document.title = 'Logged in';
  const root = document.getElementById('app') || document.body;
  if (root) {
    root.innerHTML =
      '<div style="' +
      'font-family: system-ui, -apple-system, sans-serif;' +
      'display: flex; align-items: center; justify-content: center;' +
      'min-height: 100vh; padding: 2em; text-align: center;' +
      'font-size: 1.25em; color: #333;' +
      '">' + message + '</div>';
  }
}

export default closeOrRedirect;
