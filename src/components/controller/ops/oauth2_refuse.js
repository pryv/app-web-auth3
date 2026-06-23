/**
 * POST `<pryvApi>/oauth2/authorize/refuse` with the signed state.
 * Server verifies signature, returns the redirect URL with
 * error=access_denied. No access created. No user session needed.
 */
async function oauth2Refuse (ctx) {
  if (ctx.oauth2 == null || typeof ctx.oauth2.signedState !== 'string') {
    throw new Error('oauth2_refuse: ctx.oauth2.signedState is required');
  }
  if (typeof ctx.oauth2.pryvApi !== 'string' || ctx.oauth2.pryvApi.length === 0) {
    throw new Error('oauth2_refuse: ctx.oauth2.pryvApi is required');
  }

  const url = ctx.oauth2.pryvApi.replace(/\/$/, '') + '/oauth2/authorize/refuse';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: ctx.oauth2.signedState }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.error_description || json.error || ('oauth refuse failed: HTTP ' + res.status));
    err.oauthError = json.error;
    err.status = res.status;
    throw err;
  }
  if (typeof json.redirectTo !== 'string' || json.redirectTo.length === 0) {
    throw new Error('oauth2_refuse: server response missing redirectTo');
  }
  return json.redirectTo;
}

export default oauth2Refuse;
