/**
 * Parse the signed OAuth state from the URL into the display fields
 * the consent UI needs (clientId, requested scope, etc.).
 *
 * The state is `<base64url(json-payload)>.<base64url(hmac)>`. We
 * decode the payload for DISPLAY ONLY — never trust it for security
 * (the server re-verifies the signature when we POST to /accept or
 * /refuse). A tampered state will fail at the server with an
 * `invalid_request bad_signature` we render as an error.
 *
 * Throws on malformed input — caller renders an error.
 */
function parseOAuthState (signedState) {
  if (typeof signedState !== 'string' || signedState.length === 0) {
    throw new Error('parseOAuthState: state is required');
  }
  const dot = signedState.indexOf('.');
  if (dot <= 0 || dot === signedState.length - 1) {
    throw new Error('parseOAuthState: malformed state (missing signature separator)');
  }
  const body = signedState.slice(0, dot);
  const padded = body.replace(/-/g, '+').replace(/_/g, '/') +
    '=='.slice(0, (4 - body.length % 4) % 4);
  const raw = decodeBase64(padded);
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    throw new Error('parseOAuthState: payload is not valid JSON');
  }
  if (typeof payload !== 'object' || payload == null) {
    throw new Error('parseOAuthState: payload must be a JSON object');
  }
  return {
    clientId: typeof payload.clientId === 'string' ? payload.clientId : '',
    redirectUri: typeof payload.redirectUri === 'string' ? payload.redirectUri : '',
    scope: Array.isArray(payload.scope) ? payload.scope.filter(s => typeof s === 'string') : [],
    userIdHint: typeof payload.userIdHint === 'string' ? payload.userIdHint : null,
    iat: typeof payload.iat === 'number' ? payload.iat : null,
    exp: typeof payload.exp === 'number' ? payload.exp : null,
  };
}

function decodeBase64 (s) {
  // Works both in browser (atob) and in jest (Buffer).
  if (typeof atob === 'function') return atob(s);
  return Buffer.from(s, 'base64').toString('binary');
}

export default parseOAuthState;
