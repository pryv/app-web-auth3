import AppError from '../../models/AppError.js';

// Pryv API call to write the consent/scope-update-cmc trigger event
// with the freshly-minted personal token; poll the trigger's status
// until completed or failed; return { acceptEventId, status }.
//
// Same shape as cmc_accept.js — the orchestration on the server side
// runs accesses.update (under suppression) before delivering the
// scope-update notification to the peer collector stream. Server-side
// chain check (canUpdateAccess + canCreateAccess) is what bounds the
// proposed permissions to what the trigger-writer can grant.

const POLL_INTERVAL_MS = 250;
const POLL_TIMEOUT_MS = 20000;

async function cmcScopeUpdate (ctx, params) {
  if (!ctx.user || !ctx.user.personalToken) {
    throw new AppError('Personal token required (login step did not complete).');
  }
  if (!params || typeof params.scopeRequestEventId !== 'string' || params.scopeRequestEventId.length === 0) {
    throw new AppError('Missing scope-request event id.');
  }
  if (typeof params.scopeStreamId !== 'string' || params.scopeStreamId.length === 0) {
    throw new AppError('Missing scope stream id.');
  }
  if (typeof params.action !== 'string' || (params.action !== 'accept' && params.action !== 'refuse')) {
    throw new AppError('Action must be "accept" or "refuse".');
  }
  const username = ctx.user.username;
  const pryvApi = (ctx.pryvApiBase || '').replace(/\/$/, '');
  if (!pryvApi) {
    throw new AppError('Missing Pryv API base.');
  }

  const eventsUrl = pryvApi + '/' + encodeURIComponent(username) + '/events';
  const content = {
    scopeRequestEventId: params.scopeRequestEventId,
    accept: params.action === 'accept',
  };
  if (params.action === 'refuse' && params.reason && typeof params.reason === 'object') {
    content.reason = params.reason;
  }

  const createRes = await fetch(eventsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: ctx.user.personalToken,
    },
    body: JSON.stringify({
      streamIds: [params.scopeStreamId],
      type: 'consent/scope-update-cmc',
      content,
    }),
  });
  const createJson = await safeJson(createRes);
  if (!createRes.ok || !createJson || !createJson.event || typeof createJson.event.id !== 'string') {
    throw new AppError(extractApiErrorMessage(createJson) || ('Scope-update trigger create failed: HTTP ' + createRes.status));
  }
  const updateEventId = createJson.event.id;

  const eventUrl = eventsUrl + '/' + encodeURIComponent(updateEventId);
  const t0 = Date.now();
  let lastEvent = createJson.event;
  while (Date.now() - t0 < POLL_TIMEOUT_MS) {
    const getRes = await fetch(eventUrl, {
      headers: { Authorization: ctx.user.personalToken },
    });
    const getJson = await safeJson(getRes);
    const event = getJson && getJson.event ? getJson.event : null;
    if (event) lastEvent = event;
    const status = event && event.content && event.content.status;
    if (status === 'completed') {
      return { updateEventId, status };
    }
    if (status === 'failed') {
      const reason = (event.content.failure && event.content.failure.reason) || 'cmc-scope-update-failed';
      throw new AppError('Scope update failed: ' + reason);
    }
    await sleep(POLL_INTERVAL_MS);
  }
  const stale = lastEvent && lastEvent.content ? lastEvent.content.status : 'unknown';
  throw new AppError('Scope update timed out waiting for orchestration (last status=' + String(stale) + ').');
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeJson (res) {
  try { return await res.json(); } catch (_e) { return null; }
}

function extractApiErrorMessage (json) {
  if (!json || typeof json !== 'object') return null;
  const err = json.error;
  if (!err || typeof err !== 'object') return null;
  const cmcId = err.data && err.data.id;
  if (typeof cmcId === 'string' && cmcId.length > 0) {
    return (err.message || 'Scope update failed') + ' (' + cmcId + ')';
  }
  return err.message || err.id || null;
}

export default cmcScopeUpdate;
