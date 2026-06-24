<template>
  <div>
    <h1>Accept scope update</h1>

    <div
      v-if="initError"
      id="cmcSuInitError"
      class="cmc-su-init-error">
      <h2>Invalid scope-update request</h2>
      <p>{{ initError }}</p>
    </div>

    <div
      v-else-if="!scopeRequest"
      id="cmcSuLoading"
      class="cmc-su-loading">
      <p>Loading scope-update request…</p>
    </div>

    <CmcScopeUpdateConsent
      v-else-if="scopeRequest && !needsLogin"
      :scopeRequest="scopeRequest"
      :submitting="submitting"
      @accepted="onAccept"
      @refused="onRefuse"/>

    <v-form
      v-else-if="needsLogin"
      ref="form"
      v-model="validForm"
      @submit.prevent>
      <p
        id="cmcSuLoginPrompt"
        class="cmc-su-login-prompt">
        Sign in to <b>{{ pryvApiHost }}</b> to confirm this scope update.
      </p>

      <v-text-field
        id="cmcSuUsername"
        v-model="user.username"
        :rules="[rules.required]"
        label="Username"/>

      <Password v-model="password"/>

      <v-btn
        id="cmcSuSubmitLogin"
        :disabled="!validForm || submitting"
        @click="submitLogin"
      >Sign In</v-btn>

      <v-btn
        id="cmcSuCancel"
        :disabled="submitting"
        @click="onCancel"
      >Cancel</v-btn>
    </v-form>

    <Alerts :errorMsg="error"/>
  </div>
</template>

<script>
import Password from './bits/Password.vue';
import CmcScopeUpdateConsent from './bits/CmcScopeUpdateConsent.vue';
import Alerts from './bits/Alerts.vue';
import cmcScopeUpdateOp from '../controller/ops/cmc_scope_update.js';

// /cmc-scope-update query params:
//   scopeRequestEventId  REQUIRED — the collector-side request event id (resolved on user's API).
//   scopeStreamId        REQUIRED — user's own :_cmc:apps:* stream to write the trigger to.
//                                   Defaults to the scope-request event's home stream when omitted.
//   pryvApi              REQUIRED — base URL of the user's Pryv API (used for login + events.* calls).
//   returnUrl            OPTIONAL — full-page-redirect target (switches to redirect mode).
//   mode                 OPTIONAL — 'popup' (default) or 'redirect'.
//
// Return payload (popup mode → postMessage; redirect mode → URL querystring `cmcScopeUpdateResult`):
//   { type: 'cmc-scope-update-result', ok: true,  updateEventId, action: 'accept' | 'refuse' }
//   { type: 'cmc-scope-update-result', ok: false, reason }

const POSTMSG_TYPE = 'cmc-scope-update-result';

export default {
  components: { Password, CmcScopeUpdateConsent, Alerts },
  data: () => ({
    scopeRequestEventId: '',
    scopeStreamId: '',
    pryvApiBase: '',
    mode: 'popup',
    returnUrl: '',
    scopeRequest: null,
    needsLogin: false,
    submitting: false,
    initError: null,
    validForm: false,
    error: '',
    password: '',
    pendingAction: null, // captured at click time so submitLogin can finish it
    user: { username: '', personalToken: '' },
    rules: {
      required: (value) => !!value || 'This field is required.',
    },
  }),
  computed: {
    pryvApiHost () {
      try { return new URL(this.pryvApiBase).host; } catch (_e) { return this.pryvApiBase; }
    },
  },
  async created () {
    const q = this.$route.query || {};
    this.scopeRequestEventId = strParam(q.scopeRequestEventId);
    this.scopeStreamId = strParam(q.scopeStreamId);
    this.pryvApiBase = strParam(q.pryvApi);
    this.returnUrl = strParam(q.returnUrl) || '';
    this.mode = strParam(q.mode) || (this.returnUrl ? 'redirect' : 'popup');
    if (!this.scopeRequestEventId) {
      this.initError = 'Missing required `scopeRequestEventId` query parameter.';
      return;
    }
    if (!this.pryvApiBase) {
      this.initError = 'Missing required `pryvApi` query parameter.';
      return;
    }
    // The scope-request event sits on the user's account already (the
    // collector posted it via the data-grant access). We can't read it
    // until we have a token. Show the login form first; fetch the event
    // post-login.
    this.needsLogin = true;
  },
  methods: {
    onAccept () {
      this.pendingAction = 'accept';
      if (!this.user.personalToken) {
        this.needsLogin = true;
        return;
      }
      this.runOp();
    },
    onRefuse () {
      this.pendingAction = 'refuse';
      if (!this.user.personalToken) {
        this.needsLogin = true;
        return;
      }
      this.runOp();
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
        // After login, fetch the scope-request event so the consent UI
        // can render its details. If the user clicked Accept/Refuse
        // BEFORE login (rare but possible if the consent UI ever shows
        // pre-login), run the op right away.
        if (this.pendingAction == null) {
          await this.fetchScopeRequest();
          this.needsLogin = false;
        } else {
          await this.runOp();
        }
      } catch (err) {
        this.error = err.message || 'Login failed.';
      } finally {
        this.submitting = false;
      }
    },
    async loginAgainstPryv () {
      const url = this.pryvApiBase.replace(/\/$/, '') +
        '/' + encodeURIComponent(this.user.username) + '/auth/login';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.user.username,
          password: this.password,
          appId: 'app-web-auth3-cmc-scope-update',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || typeof json.token !== 'string') {
        const msg = (json.error && json.error.message) || ('Login failed: HTTP ' + res.status);
        throw new Error(msg);
      }
      this.user.personalToken = json.token;
    },
    async fetchScopeRequest () {
      const url = this.pryvApiBase.replace(/\/$/, '') +
        '/' + encodeURIComponent(this.user.username) +
        '/events/' + encodeURIComponent(this.scopeRequestEventId);
      const res = await fetch(url, {
        headers: { Authorization: this.user.personalToken },
      });
      const json = await res.json().catch(() => ({}));
      const event = json && json.event ? json.event : null;
      if (!res.ok || event == null) {
        const msg = (json && json.error && json.error.message) ||
          ('Could not fetch scope-request event: HTTP ' + res.status);
        throw new Error(msg);
      }
      if (event.type !== 'consent/scope-request-cmc') {
        throw new Error('Event ' + this.scopeRequestEventId + ' is not a consent/scope-request-cmc (got ' + event.type + ').');
      }
      // Default scopeStreamId to the scope-request event's home stream.
      if (!this.scopeStreamId) {
        const sids = Array.isArray(event.streamIds) ? event.streamIds : [];
        this.scopeStreamId = sids[0] || '';
        if (!this.scopeStreamId) {
          throw new Error('Could not derive scopeStreamId from scope-request event ' + this.scopeRequestEventId + '.');
        }
      }
      this.scopeRequest = event;
    },
    async runOp () {
      this.submitting = true;
      this.error = '';
      try {
        const result = await cmcScopeUpdateOp(
          {
            user: this.user,
            pryvApiBase: this.pryvApiBase,
          },
          {
            scopeRequestEventId: this.scopeRequestEventId,
            scopeStreamId: this.scopeStreamId,
            action: this.pendingAction,
          }
        );
        this.returnResult({
          ok: true,
          updateEventId: result.updateEventId,
          action: this.pendingAction,
        });
      } catch (err) {
        this.error = err.message || 'Scope update failed.';
      } finally {
        this.submitting = false;
      }
    },
    returnResult (payload) {
      const msg = Object.assign({ type: POSTMSG_TYPE }, payload);
      if (this.mode === 'redirect' && this.returnUrl) {
        let url = this.returnUrl;
        const sep = url.includes('?') ? '&' : '?';
        url += sep + 'cmcScopeUpdateResult=' + encodeURIComponent(JSON.stringify(msg));
        window.location.assign(url);
        return;
      }
      if (window.opener) {
        try { window.opener.postMessage(msg, '*'); } catch (_e) { /* cross-origin */ }
      }
      try { window.close(); } catch (_e) { /* same-origin restriction */ }
      const root = document.getElementById('app') || document.body;
      if (root) {
        root.innerHTML =
          '<div style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2em; text-align: center; font-size: 1.25em; color: #333;">' +
          (payload.ok ? 'Scope update recorded. You can close this window.' : 'Closed. You can close this window.') +
          '</div>';
      }
    },
  },
};

function strParam (v) {
  return typeof v === 'string' ? v : '';
}
</script>

<style scoped>
.cmc-su-init-error { color: #b00020; }
.cmc-su-loading { color: #666; padding: 2em; text-align: center; }
.cmc-su-login-prompt { margin-bottom: 1em; }
</style>
