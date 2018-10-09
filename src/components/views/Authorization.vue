<template>
  <div>
    <v-alert
      :value="err"
      type="error"
      transition="scale-transition"
    >{{ err }}</v-alert>

    <Permissions
      v-if="permissionsList"
      :appId="appId"
      :permissionsList="permissionsList"
      :accept="accept"
      :refuse="refuse"/>

    <v-form
      v-else
      ref="form"
      v-model="validForm">

      <h1>Sign in</h1>

      <v-text-field
        id="usernameOrEmail"
        v-model="username"
        :rules="[rules.required]"
        label="Username or email"/>

      <Password v-model="password"/>

      <v-btn
        id="submitButton"
        :disabled="!validForm"
        @click="submit"
      >Sign In</v-btn>

      <v-btn
      >Cancel</v-btn>

      <div>
        Feel free to reach our
        <a
          target="_blank"
          href="https://pryv.com/helpdesk">
          helpdesk</a>
        if you have questions.
      </div>
    </v-form>
  </div>
</template>

<script>
import Password from './bits/Password.vue';
import Permissions from './bits/Permissions.vue';
import Pryv from '../models/Pryv.js';
import PermissionsObj from '../models/Permissions.js';
import {AcceptedAuthState, RefusedAuthState} from '../models/AuthStates.js';

export default {
  components: {
    Password,
    Permissions,
  },
  props: {
    appId: {type: String, default: null},
    domain: {type: String, default: null},
    permissionsString: {type: String, default: null},
    pollKey: {type: String, default: null},
    returnURL: {type: String, default: null},
    oauthState: {type: String, default: null},
  },
  data: () => ({
    username: '',
    password: '',
    personalToken: '',
    appToken: '',
    err: '',
    permissionsList: null,
    rules: {
      required: value => !!value || 'This field is required.',
      email: value => /.+@.+/.test(value) || 'E-mail must be valid',
    },
    validForm: false,
  }),
  created () {
    if (this.permissionsString == null) {
      this.err = 'Missing requested permissions!';
    }
    if (this.pollKey == null) {
      this.err = 'Missing poll key!';
    }
    this.permissionsObj = new PermissionsObj(this.permissionsString);
    this.pryv = new Pryv(this.domain, this.appId, err => {
      this.err = JSON.stringify(err);
    });
  },
  methods: {
    async submit () {
      if (this.$refs.form.validate()) {
        // Convert email to Pryv username if needed
        if (this.username.search('@') > 0) {
          this.username = await this.pryv.getUsernameForEmail(this.username);
        }

        if (this.username == null) return;

        // Login against Pryv
        this.personalToken = await this.pryv.login(this.username, this.password);

        if (this.personalToken == null) return;

        // Check for existing app access
        const checkApp = await this.pryv.checkAppAccess(this.username, this.permissionsObj.list, this.personalToken);

        if (checkApp == null) return;

        // If a mismatching access exists, show an error
        if (checkApp.mismatch) {
          this.err = 'Mismatching access already exists: ' + JSON.stringify(checkApp.mismatch);
          return;
        }

        // If a matching access exists, just return it
        if (checkApp.match) {
          await this.closingFlow(new AcceptedAuthState(this.username, checkApp.match.token));
          return;
        }

        // Otherwise, show the requested permissions to the user
        this.permissionsList = this.permissionsObj.updateList(checkApp.permissions);
      }
    },
    // The user accepts the requested permissions
    async accept () {
      // Create a new app access
      this.appToken = await this.pryv.createAppAccess(this.username, this.permissionsList, this.personalToken);

      if (this.appToken == null) return;

      await this.closingFlow(new AcceptedAuthState(this.username, this.appToken));
    },
    // The user refuses the requested permissions
    async refuse () {
      await this.closingFlow(new RefusedAuthState());
    },
    // Advertise state and close
    async closingFlow (state) {
      await this.pryv.updateAuthState(this.pollKey, state);

      if (this.err == null) {
        this.endPopup(state);
      }
    },
    // Closing the auth page
    endPopup (state) {
      let href = this.returnURL;
      // If no return URL was provided, just close the popup
      if (href == null || !href) {
        window.close();
      } else {
        // Otherwise, we need to redirect to the return URL,
        // passing the resulting parameters as querystring
        if (this.oauthState) {
          href += `?state=${this.oauthState}&code=${this.pollKey}`;
        } else {
          href += `?prYvkey=${this.pollKey}`;

          Object.keys(state.body).forEach(key => {
            href += `&prYv${key}=${state.body[key]}`;
          });
        }
        this.$router.push(href);
      }
    },
  },
};
</script>
