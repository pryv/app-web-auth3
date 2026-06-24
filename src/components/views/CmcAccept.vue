<template>
  <div>
    <h1>Accept consent request</h1>

    <div
      v-if="initError"
      id="cmcInitError"
      class="cmc-init-error">
      <h2>Invalid accept request</h2>
      <p>{{ initError }}</p>
    </div>

    <div
      v-else-if="!offer"
      id="cmcOfferLoading"
      class="cmc-offer-loading">
      <p>Loading consent request…</p>
    </div>

    <CmcConsent
      v-else-if="offer && !needsLogin"
      :offer="offer"
      :submitting="submitting"
      @accepted="onAccept"
      @refused="onRefuse"/>

    <v-form
      v-else-if="needsLogin"
      ref="form"
      v-model="validForm"
      @submit.prevent>
      <p
        v-if="offer"
        id="cmcLoginPrompt"
        class="cmc-login-prompt">
        Sign in to <b>{{ pryvApiHost }}</b> to accept this request from
        <b>{{ requesterLabel }}</b>.
      </p>

      <v-text-field
        id="cmcUsername"
        v-model="user.username"
        :rules="[rules.required]"
        label="Username"/>

      <Password v-model="password"/>

      <v-btn
        id="cmcSubmitLogin"
        :disabled="!validForm || submitting"
        @click="submitLogin"
      >Sign In</v-btn>

      <v-btn
        id="cmcCancel"
        :disabled="submitting"
        @click="onCancel"
      >Cancel</v-btn>
    </v-form>

    <Alerts :errorMsg="error"/>
  </div>
</template>

<script>
import Password from './bits/Password.vue';
import CmcConsent from './bits/CmcConsent.vue';
import Alerts from './bits/Alerts.vue';
import cmcAcceptOp from '../controller/ops/cmc_accept.js';

// /cmc-accept query params:
//   capabilityUrl  REQUIRED — the requester-side capability URL minted at request time.
//   scopeStreamId  REQUIRED — the recipient's :_cmc:apps:* stream to write the trigger to.
//   pryvApi        REQUIRED — base URL of the recipient's Pryv API (used for login + events.create).
//   accessName     OPTIONAL — override name for the data-grant access (default: derived from offer).
//   returnUrl      OPTIONAL — full-page-redirect target (mutually exclusive with popup mode).
//   mode           OPTIONAL — 'popup' (default) or 'redirect'. Popup uses window.opener.postMessage;
//                  redirect uses location.assign(returnUrl + querystring).
//
// Return payload (popup mode → postMessage; redirect mode → URL querystring):
//   { type: 'cmc-accept-result', ok: true,  dataGrantApiEndpoint, acceptEventId }
//   { type: 'cmc-accept-result', ok: false, reason }
//
// The page renders the offer details (fetched via the capability URL,
// which is itself an authenticated apiEndpoint) BEFORE the login form so
// the user knows what they're signing in to accept. The login produces
// a personal token used to write the consent/accept-cmc trigger.

const POSTMSG_TYPE = 'cmc-accept-result';

export default {
  components: { Password, CmcConsent, Alerts },
  data: () => ({
    capabilityUrl: '',
    scopeStreamId: '',
    pryvApiBase: '',
    accessName: null,
    mode: 'popup',
    returnUrl: '',
    offer: null,
    needsLogin: false,
    submitting: false,
    initError: null,
    validForm: false,
    error: '',
    password: '',
    user: { username: '', personalToken: '' },
    rules: {
      required: (value) => !!value || 'This field is required.',
    },
  }),
  computed: {
    requesterLabel () {
      const meta = (this.offer && this.offer.requesterMeta) || {};
      const username = meta.username || '(unknown)';
      const host = meta.host || '';
      return host ? username + '@' + host : username;
    },
    pryvApiHost () {
      try { return new URL(this.pryvApiBase).host; } catch (_e) { return this.pryvApiBase; }
    },
  },
  async created () {
    const q = this.$route.query || {};
    this.capabilityUrl = strParam(q.capabilityUrl);
    this.scopeStreamId = strParam(q.scopeStreamId);
    this.pryvApiBase = strParam(q.pryvApi);
    this.accessName = strParam(q.accessName) || null;
    this.returnUrl = strParam(q.returnUrl) || '';
    this.mode = strParam(q.mode) || (this.returnUrl ? 'redirect' : 'popup');
    if (!this.capabilityUrl) {
      this.initError = 'Missing required `capabilityUrl` query parameter.';
      return;
    }
    if (!this.scopeStreamId) {
      this.initError = 'Missing required `scopeStreamId` query parameter.';
      return;
    }
    if (!this.pryvApiBase) {
      this.initError = 'Missing required `pryvApi` query parameter.';
      return;
    }
    try {
      this.offer = await fetchOfferViaCapability(this.capabilityUrl);
    } catch (err) {
      this.initError = 'Could not read the consent offer: ' + (err.message || String(err));
      return;
    }
    // First show consent UI; sign-in happens on Accept click (see onAccept).
    this.needsLogin = false;
  },
  methods: {
    onAccept () {
      if (!this.user.personalToken) {
        this.needsLogin = true;
        return;
      }
      this.doAccept();
    },
    onRefuse () {
      this.returnResult({ ok: false, reason: 'user-refused' });
    },
    onCancel () {
      this.returnResult({ ok: false, reason: 'user-cancelled' });
    },
    async submitLogin () {
      this.user.username = this.user.username.trim();
      if (!this.$refs.form.validate()) return;
      this.submitting = true;
      this.error = '';
      try {
        await this.loginAgainstPryv();
        this.needsLogin = false;
        await this.doAccept();
      } catch (err) {
        this.error = err.message || 'Login failed.';
      } finally {
        this.submitting = false;
      }
    },
    async loginAgainstPryv () {
      // Same shape as /reg/access login + OAuth2Authorize.loginAgainstPryv
      // — POST {username, password} → personalToken.
      const url = this.pryvApiBase.replace(/\/$/, '') +
        '/' + encodeURIComponent(this.user.username) + '/auth/login';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.user.username,
          password: this.password,
          appId: 'app-web-auth3-cmc-accept',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || typeof json.token !== 'string') {
        const msg = (json.error && json.error.message) || ('Login failed: HTTP ' + res.status);
        throw new Error(msg);
      }
      this.user.personalToken = json.token;
    },
    async doAccept () {
      this.submitting = true;
      this.error = '';
      try {
        const result = await cmcAcceptOp(
          {
            user: this.user,
            pryvApiBase: this.pryvApiBase,
          },
          {
            capabilityUrl: this.capabilityUrl,
            scopeStreamId: this.scopeStreamId,
            accessName: this.accessName,
          }
        );
        this.returnResult({
          ok: true,
          dataGrantApiEndpoint: result.dataGrantApiEndpoint,
          acceptEventId: result.acceptEventId,
        });
      } catch (err) {
        this.error = err.message || 'Accept failed.';
      } finally {
        this.submitting = false;
      }
    },
    returnResult (payload) {
      const msg = Object.assign({ type: POSTMSG_TYPE }, payload);
      if (this.mode === 'redirect' && this.returnUrl) {
        let url = this.returnUrl;
        const sep = url.includes('?') ? '&' : '?';
        url += sep + 'cmcAcceptResult=' + encodeURIComponent(JSON.stringify(msg));
        window.location.assign(url);
        return;
      }
      // popup mode: postMessage to opener, then close.
      if (window.opener) {
        // Targeting '*' is OK because the payload carries no secrets the
        // app couldn't ask the user to confirm again — the data-grant
        // apiEndpoint is meant for the calling app, and the app is by
        // definition the opener. (If a malicious iframe intercepted, the
        // user would still have seen the consent UI in this page.)
        try {
          window.opener.postMessage(msg, '*');
        } catch (_e) { /* opener may be cross-origin without postMessage rights */ }
      }
      try { window.close(); } catch (_e) { /* same-origin restriction */ }
      // Fallback if window.close didn't work (some browsers block close
      // on tabs that weren't opened by script): show a "you can close
      // this window" terminal message.
      const root = document.getElementById('app') || document.body;
      if (root) {
        root.innerHTML =
          '<div style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2em; text-align: center; font-size: 1.25em; color: #333;">' +
          (payload.ok ? 'Accepted. You can close this window.' : 'Closed. You can close this window.') +
          '</div>';
      }
    },
  },
};

function strParam (v) {
  return typeof v === 'string' ? v : '';
}

async function fetchOfferViaCapability (capabilityUrl) {
  // The capability URL is a Pryv apiEndpoint (`https://<token>@<host>/`).
  // The capability access has read on the offer stream
  // `:_cmc:_internal:offer:<capId>` — we extract the token from the URL
  // and call /events on the host to fetch the single offer event.
  const u = new URL(capabilityUrl);
  const token = decodeURIComponent(u.username || '');
  if (!token) throw new Error('capability URL missing token');
  const base = u.protocol + '//' + u.host + u.pathname.replace(/\/$/, '');
  const res = await fetch(base + '/events?streams=' + encodeURIComponent(':_cmc:_internal:offer') + '&limit=1', {
    headers: { Authorization: token },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json.error && json.error.message) || ('offer fetch failed: HTTP ' + res.status);
    throw new Error(msg);
  }
  const events = Array.isArray(json.events) ? json.events : [];
  if (events.length === 0) {
    throw new Error('offer is empty (capability may have been consumed or invalidated)');
  }
  // Return the offer event's content (request, requesterMeta, …).
  return events[0].content || {};
}
</script>

<style scoped>
.cmc-init-error { color: #b00020; }
.cmc-offer-loading { color: #666; padding: 2em; text-align: center; }
.cmc-login-prompt { margin-bottom: 1em; }
</style>
