/**
 * POST `<pryvApi>/oauth2/authorize/accept` with the signed state, the
 * user's authenticated session, and the granted-scope subset. Server
 * mints the access (full accesses.create chain) and returns the
 * redirect URL the client should navigate to.
 *
 * `ctx` carries:
 *   - oauth2: { signedState, pryvApi }   (set by OAuth2Authorize.vue)
 *   - user:   { username, personalToken } (set by login)
 */
async function oauth2Accept (ctx, grantedScope) {
  if (ctx.oauth2 == null || typeof ctx.oauth2.signedState !== 'string') {
    throw new Error('oauth2_accept: ctx.oauth2.signedState is required');
  }
  if (typeof ctx.oauth2.pryvApi !== 'string' || ctx.oauth2.pryvApi.length === 0) {
    throw new Error('oauth2_accept: ctx.oauth2.pryvApi is required');
  }
  if (typeof ctx.user.username !== 'string' || ctx.user.username.length === 0) {
    throw new Error('oauth2_accept: user not signed in (username missing)');
  }
  if (typeof ctx.user.personalToken !== 'string' || ctx.user.personalToken.length === 0) {
    throw new Error('oauth2_accept: user not signed in (token missing)');
  }
  if (!Array.isArray(grantedScope)) {
    throw new Error('oauth2_accept: grantedScope must be an array');
  }

  const url = ctx.oauth2.pryvApi.replace(/\/$/, '') + '/oauth2/authorize/accept';
  const body = {
    state: ctx.oauth2.signedState,
    username: ctx.user.username,
    userToken: ctx.user.personalToken,
    grantedScope,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.error_description || json.error || ('oauth accept failed: HTTP ' + res.status));
    err.oauthError = json.error;
    err.status = res.status;
    throw err;
  }
  if (typeof json.redirectTo !== 'string' || json.redirectTo.length === 0) {
    throw new Error('oauth2_accept: server response missing redirectTo');
  }
  return json.redirectTo;
}

export default oauth2Accept;
