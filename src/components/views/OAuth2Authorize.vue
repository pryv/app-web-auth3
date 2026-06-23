<template>
  <div>
    <h1>Sign in</h1>

    <OAuth2Consent
      v-if="consentReady && oauthState != null"
      :clientId="oauthState.clientId"
      :scope="oauthState.scope"
      :submitting="submitting"
      @accepted="onAccept"
      @refused="onRefuse"/>

    <div
      v-if="oauthState == null && initError != null"
      id="oauthInitError"
      class="oauth-init-error">
      <h2>Invalid authorization request</h2>
      <p>{{ initError }}</p>
    </div>

    <v-form
      v-if="oauthState != null && !consentReady"
      ref="form"
      v-model="validForm"
      @submit.prevent>
      <p
        id="oauthAppPrompt"
        class="oauth-app-prompt">
        <b>{{ oauthState.clientId }}</b> wants to access your Pryv account.
      </p>

      <v-text-field
        id="usernameOrEmail"
        v-model="user.username"
        :rules="[rules.required]"
        label="Username or email"/>

      <Password v-model="password"/>

      <v-btn
        id="submitButton"
        :disabled="!validForm || submitting"
        @click="submit"
      >Sign In</v-btn>

      <v-btn
        id="oauthCancelLogin"
        :disabled="submitting"
        @click="onRefuse"
      >Cancel</v-btn>
    </v-form>

    <Alerts :errorMsg="error"/>
  </div>
</template>

<script>
import Password from './bits/Password.vue';
import OAuth2Consent from './bits/OAuth2Consent.vue';
import Alerts from './bits/Alerts.vue';
import parseOAuthState from '../controller/ops/parse_oauth_state.js';
import oauth2Accept from '../controller/ops/oauth2_accept.js';
import oauth2Refuse from '../controller/ops/oauth2_refuse.js';

export default {
  components: {
    Password,
    OAuth2Consent,
    Alerts,
  },
  data: () => ({
    password: '',
    error: '',
    initError: null,
    submitting: false,
    consentReady: false,
    validForm: false,
    user: {
      username: '',
      personalToken: '',
    },
    oauthState: null,
    pryvApi: '',
    rules: {
      required: (value) => !!value || 'This field is required.',
    },
  }),
  created () {
    const q = this.$route.query || {};
    const signedState = typeof q.state === 'string' ? q.state : '';
    const pryvApi = typeof q.pryvApi === 'string' ? q.pryvApi : '';
    if (!signedState) {
      this.initError = 'Missing required `state` query parameter.';
      return;
    }
    if (!pryvApi) {
      this.initError = 'Missing required `pryvApi` query parameter.';
      return;
    }
    try {
      this.oauthState = parseOAuthState(signedState);
    } catch (err) {
      this.initError = err.message;
      return;
    }
    this.pryvApi = pryvApi;
    this.signedState = signedState;
    if (this.oauthState.userIdHint) {
      this.user.username = this.oauthState.userIdHint;
    }
  },
  methods: {
    ctxForOps () {
      return {
        user: this.user,
        oauth2: { signedState: this.signedState, pryvApi: this.pryvApi },
      };
    },
    async submit () {
      this.user.username = this.user.username.trim();
      if (!this.$refs.form.validate()) return;
      this.submitting = true;
      this.error = '';
      try {
        await this.loginAgainstPryv();
        this.consentReady = true;
      } catch (err) {
        this.error = err.message || 'Login failed.';
      } finally {
        this.submitting = false;
      }
    },
    async loginAgainstPryv () {
      // POST {username, password} → personalToken. Same shape as the
      // existing /reg/access login path on the Pryv API; result is used
      // to authenticate the subsequent /oauth2/authorize/accept call.
      const url = this.pryvApi.replace(/\/$/, '') + '/' + encodeURIComponent(this.user.username) + '/auth/login';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.user.username,
          password: this.password,
          appId: this.oauthState.clientId,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || typeof json.token !== 'string') {
        const msg = (json.error && json.error.message) || ('Login failed: HTTP ' + res.status);
        throw new Error(msg);
      }
      this.user.personalToken = json.token;
    },
    async onAccept (grantedScope) {
      this.submitting = true;
      this.error = '';
      try {
        const redirectTo = await oauth2Accept(this.ctxForOps(), grantedScope);
        window.location.assign(redirectTo);
      } catch (err) {
        this.error = err.message || 'Failed to accept authorization.';
      } finally {
        this.submitting = false;
      }
    },
    async onRefuse () {
      this.submitting = true;
      this.error = '';
      try {
        const redirectTo = await oauth2Refuse(this.ctxForOps());
        window.location.assign(redirectTo);
      } catch (err) {
        this.error = err.message || 'Failed to refuse authorization.';
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.oauth-init-error { color: #b00020; }
.oauth-app-prompt { margin-bottom: 1em; }
</style>
