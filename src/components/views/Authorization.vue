<template>
  <div>
    <h1>Sign in</h1>

    <Permissions
      v-if="permissionsList!=null"
      :appId="appId"
      :permissionsList="permissionsList"
      :clientData="serviceInfos.clientData"
      @accepted="accept"
      @refused="refuse"/>

    <v-form
      ref="form"
      v-model="validForm">

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
        @click="refuse"
      >Cancel</v-btn>

      <div v-if="serviceInfos.support">
        Feel free to reach our
        <a
          :href="serviceInfos.support"
          target="_blank">
          helpdesk</a>
        if you have questions.
      </div>
    </v-form>

    <v-divider class="mt-3 mb-2"/>

    <router-link :to="{ name: 'RegisterUser' }"><h3>Create an account</h3></router-link>

    <router-link :to="{ name: 'ResetPassword' }"><h3>Forgot password</h3></router-link>

    <Alerts
      :successMsg="success"
      :errorMsg="error"/>
  </div>
</template>

<script>
import Password from './bits/Password.vue';
import Permissions from './bits/Permissions.vue';
import Alerts from './bits/Alerts.vue';
import {AcceptedAuthState, RefusedAuthState} from '../models/AuthStates.js';
import Context from '../../Context.js';

export default {
  components: {
    Password,
    Permissions,
    Alerts,
  },
  data: () => ({
    username: '',
    password: '',
    personalToken: '',
    appToken: '',
    appId: Context.appId,
    error: '',
    success: '',
    permissionsList: null,
    serviceInfos: {},
    rules: {
      required: value => !!value || 'This field is required.',
      email: value => /.+@.+/.test(value) || 'E-mail must be valid',
    },
    validForm: false,
  }),
  async created () {
    try {
      this.serviceInfos = await Context.pryv.getServiceInfo();
    } catch (err) {
      this.throwError(err);
    }
  },
  methods: {
    async submit () {
      if (this.$refs.form.validate()) {
        try {
          // Convert email to Pryv username if needed
          this.username = await Context.pryv.getUsernameForEmail(this.username);

          // Login against Pryv
          this.personalToken = await Context.pryv.login(this.username, this.password);

          // Check for existing app access
          const checkApp = await Context.pryv.checkAppAccess(this.username, Context.permissions.list, this.personalToken);

          // If a mismatching access exists, show an error
          if (checkApp.mismatch) {
            this.err = 'Mismatching access already exists: ' + JSON.stringify(checkApp.mismatch);
          }

          // If a matching access exists, just return it
          if (checkApp.match) {
            await this.closingFlow(new AcceptedAuthState(this.username, checkApp.match.token));
          }

          // Otherwise, show the requested permissions to the user
          if (checkApp.permissions) {
            this.permissionsList = Context.permissions.updateList(checkApp.permissions);
          }
        } catch (err) {
          this.throwError(err);
        }
      }
    },
    // The user accepts the requested permissions
    async accept () {
      try {
        // Create a new app access
        this.appToken = await Context.pryv.createAppAccess(this.username, this.permissionsList, this.personalToken);

        await this.closingFlow(new AcceptedAuthState(this.username, this.appToken));
      } catch (err) {
        this.throwError(err);
      }
    },
    // The user refuses the requested permissions
    async refuse () {
      try {
        await this.closingFlow(new RefusedAuthState());
      } catch (err) {
        this.throwError(err);
      }
    },
    // Advertise state and close
    async closingFlow (state) {
      await Context.pryv.updateAuthState(Context.pollKey, state);
      this.endPopup(state);
    },
    // Closing the auth page
    endPopup (state) {
      this.success = 'App authorization successfully completed!';

      let href = Context.returnURL;
      // If no return URL was provided, just close the popup
      if (href == null || href === 'false') {
        window.close();
      } else {
        // Otherwise, we need to redirect to the return URL,
        // passing the resulting parameters as querystring
        if (Context.oauthState) {
          href += `?state=${Context.oauthState}&code=${Context.pollKey}`;
        } else {
          href += `?prYvkey=${Context.pollKey}`;

          Object.keys(state.body).forEach(key => {
            href += `&prYv${key}=${state.body[key]}`;
          });
        }
        this.$router.push(href);
      }
    },
    throwError (error) {
      this.error = JSON.stringify(error);
      console.log(error);
    },
  },
};
</script>
