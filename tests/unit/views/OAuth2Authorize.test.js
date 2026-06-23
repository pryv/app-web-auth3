import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import OAuth2Authorize from '@/components/views/OAuth2Authorize';
import OAuth2Consent from '@/components/views/bits/OAuth2Consent';
import Vue from 'vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

// Helpers --------------------------------------------------------------

function base64url (s) {
  return Buffer.from(s).toString('base64')
    .replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function makeSignedState (payload, sig = 'fake-mac') {
  const body = base64url(JSON.stringify({
    clientId: 'myapp',
    redirectUri: 'https://app.example/cb',
    state: 'csrf-1',
    codeChallenge: 'cc',
    codeChallengeMethod: 'S256',
    scope: ['pryv:read', 'pryv:write'],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 300,
    ...payload,
  }));
  return body + '.' + sig;
}

function mountWith (query) {
  return shallowMount(OAuth2Authorize, {
    mocks: { $route: { query } },
    stubs: { RouterLink: RouterLinkStub },
  });
}

// ----------------------------------------------------------------------

describe('OAuth2Authorize.test.js', () => {
  describe('init from URL query', () => {
    it('parses signed state + pryvApi from query into component data', () => {
      const w = mountWith({ state: makeSignedState({}), pryvApi: 'https://reg.test' });
      expect(w.vm.oauthState).not.toBeNull();
      expect(w.vm.oauthState.clientId).toBe('myapp');
      expect(w.vm.oauthState.scope).toEqual(['pryv:read', 'pryv:write']);
      expect(w.vm.pryvApi).toBe('https://reg.test');
      expect(w.vm.initError).toBeNull();
    });

    it('seeds username from userIdHint when present in the signed state', () => {
      const w = mountWith({ state: makeSignedState({ userIdHint: 'alice' }), pryvApi: 'https://x' });
      expect(w.vm.user.username).toBe('alice');
    });

    it('sets initError when state query parameter is missing', () => {
      const w = mountWith({ pryvApi: 'https://x' });
      expect(w.vm.initError).toMatch(/state/);
      expect(w.vm.oauthState).toBeNull();
    });

    it('sets initError when pryvApi query parameter is missing', () => {
      const w = mountWith({ state: makeSignedState({}) });
      expect(w.vm.initError).toMatch(/pryvApi/);
    });

    it('sets initError when state is malformed (no dot separator)', () => {
      const w = mountWith({ state: 'no-dot-here', pryvApi: 'https://x' });
      expect(w.vm.initError).toMatch(/malformed|separator/);
    });
  });

  describe('login flow gate', () => {
    it('shows login form when not yet signed in', () => {
      const w = mountWith({ state: makeSignedState({}), pryvApi: 'https://x' });
      const form = w.findComponent({ ref: 'form' });
      expect(form.exists()).toBe(true);
      const consent = w.findComponent(OAuth2Consent);
      expect(consent.exists()).toBe(false);
    });

    it('shows consent dialog once consentReady is set', async () => {
      const w = mountWith({ state: makeSignedState({}), pryvApi: 'https://x' });
      w.setData({ consentReady: true });
      await Vue.nextTick();
      const consent = w.findComponent(OAuth2Consent);
      expect(consent.exists()).toBe(true);
    });

    it('disables Sign In button until the form is filled', () => {
      const w = mountWith({ state: makeSignedState({}), pryvApi: 'https://x' });
      const submit = w.find('#submitButton');
      expect(submit.attributes().disabled).toBe('true');
    });

    it('renders the init-error block when oauthState parse failed', async () => {
      const w = mountWith({ state: 'bad', pryvApi: 'https://x' });
      await Vue.nextTick();
      const errBlock = w.find('#oauthInitError');
      expect(errBlock.exists()).toBe(true);
    });
  });

  describe('ctxForOps builds the shape ops expect', () => {
    it('packs signedState + pryvApi + user into ctx', async () => {
      const w = mountWith({ state: makeSignedState({}), pryvApi: 'https://reg.test' });
      w.setData({ user: { username: 'alice', personalToken: 'tok-1' } });
      await Vue.nextTick();
      const ctx = w.vm.ctxForOps();
      expect(ctx.user.username).toBe('alice');
      expect(ctx.user.personalToken).toBe('tok-1');
      expect(ctx.oauth2.pryvApi).toBe('https://reg.test');
      expect(typeof ctx.oauth2.signedState).toBe('string');
      expect(ctx.oauth2.signedState).toContain('.');
    });
  });
});
