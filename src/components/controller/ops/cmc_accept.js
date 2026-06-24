import AppError from '../../models/AppError.js';

// Plain JS (no Flow types) — this op runs against a lightweight context
// shape constructed inline by CmcAccept.vue (`{ user, pryvApiBase }`)
// rather than the legacy `Context` class the auth flow uses.

// Pryv API call to write the consent/accept-cmc trigger event with the
// freshly-minted personal token; poll the trigger's status until
// completed or failed; return { dataGrantApiEndpoint, acceptEventId,
// rawStatus }. The orchestration that mints the local data-grant access
// + delivers the accept to the requester's platform runs server-side
// (fire-and-forget from the API's perspective) — we poll the trigger
// event's content.status / content.accessIds / content.failure for the
// outcome.
//
// On failure, throws AppError with the server-stamped reason where
// possible (`content.failure.reason` is the CMC error.id like
// `cmc-handler-offer-read-failed`).

const POLL_INTERVAL_MS = 250;
const POLL_TIMEOUT_MS = 20000;

async function cmcAccept (ctx, params) {
  if (!ctx.user || !ctx.user.personalToken) {
    throw new AppError('Personal token required (login step did not complete).');
  }
  if (!params || typeof params.capabilityUrl !== 'string' || params.capabilityUrl.length === 0) {
    throw new AppError('Missing capability URL.');
  }
  if (typeof params.scopeStreamId !== 'string' || params.scopeStreamId.length === 0) {
    throw new AppError('Missing scope stream id.');
  }
  const username = ctx.user.username;
  const pryvApi = (ctx.pryvApiBase || '').replace(/\/$/, '');
  if (!pryvApi) {
    throw new AppError('Missing Pryv API base.');
  }

  const eventsUrl = pryvApi + '/' + encodeURIComponent(username) + '/events';
  const content = { capabilityUrl: params.capabilityUrl };
  if (typeof params.accessName === 'string' && params.accessName.length > 0) {
    content.accessName = params.accessName;
  }
  if (params.features && typeof params.features === 'object') {
    content.features = params.features;
  }

  // 1. POST the trigger event with the personal token.
  const createRes = await fetch(eventsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: ctx.user.personalToken,
    },
    body: JSON.stringify({
      streamIds: [params.scopeStreamId],
      type: 'consent/accept-cmc',
      content,
    }),
  });
  const createJson = await safeJson(createRes);
  if (!createRes.ok || !createJson || !createJson.event || typeof createJson.event.id !== 'string') {
    throw new AppError(extractApiErrorMessage(createJson) || ('Accept trigger create failed: HTTP ' + createRes.status));
  }
  const acceptEventId: string = createJson.event.id;

  // 2. Poll the trigger event for orchestration outcome.
  const eventUrl = eventsUrl + '/' + encodeURIComponent(acceptEventId);
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
      const apiEndpoint =
        (event.content.grantedAccess && event.content.grantedAccess.apiEndpoint) ||
        (event.content.accessIds && event.content.accessIds.dataGrant
          ? null /* fallback shape: id-only, no endpoint */
          : null);
      if (typeof apiEndpoint !== 'string' || apiEndpoint.length === 0) {
        throw new AppError('Accept completed but no data-grant apiEndpoint surfaced.');
      }
      return { dataGrantApiEndpoint: apiEndpoint, acceptEventId, status };
    }
    if (status === 'failed') {
      const reason = (event.content.failure && event.content.failure.reason) || 'cmc-accept-failed';
      throw new AppError('Accept failed: ' + reason);
    }
    await sleep(POLL_INTERVAL_MS);
  }
  const stale = lastEvent && lastEvent.content ? lastEvent.content.status : 'unknown';
  throw new AppError('Accept timed out waiting for orchestration (last status=' + String(stale) + ').');
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
  // CMC errors carry the specific id under error.data.id.
  const cmcId = err.data && err.data.id;
  if (typeof cmcId === 'string' && cmcId.length > 0) {
    return (err.message || 'Accept failed') + ' (' + cmcId + ')';
  }
  return err.message || err.id || null;
}

export default cmcAccept;
