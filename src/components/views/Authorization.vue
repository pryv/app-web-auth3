<template>
  <div>
    <v-alert
      :value="err"
      type="error"
      transition="scale-transition"
    >{{err}}</v-alert>

    <Permissions
      v-if="checkedPermissions"
      :appId="appId"
      :permissionsArray="checkedPermissions"
      :accept="accept"
      :refuse="refuse"
    ></Permissions>

    <v-form ref="form" v-model="validForm" v-else>

      <h1>Sign in</h1>

      <v-text-field
        label="Username or email"
        id="usernameOrEmail"
        v-model="username"
        :rules="[rules.required]"
      ></v-text-field>

      <Password v-model="password"></Password>

      <v-btn
        id="submitButton"
        @click="submit"
        :disabled="!validForm"
      >Sign In</v-btn>

      <v-btn
      >Cancel</v-btn>
      
      <router-link :to="{ name: 'RegisterUser' }">Create an account</router-link>

      <router-link :to="{ name: 'ResetPassword' }">Forgot password</router-link>

      <div>
        Feel free to reach our
        <a target="_blank" href="https://pryv.com/helpdesk">helpdesk</a>
        if you have questions.
      </div>
    </v-form>
  </div>
</template>

<script>
  import Password from './bits/Password.vue';
  import Permissions from './bits/Permissions.vue';
  import Pryv from '../models/Pryv.js';
  import context from '../../context.js'

  export default {
    components: {
      Password,
      Permissions,
    },
    props: ['pollKey', 'permissionsArray'],
    data: () => ({
      username: '',
      password: '',
      personalToken: '',
      appToken: '',
      err: '',
      checkedPermissions: null,
      appId: context.settings.appId,
      rules: {
        required: value => !!value || 'This field is required.',
        email: value => /.+@.+/.test(value) || 'E-mail must be valid'
      },
      validForm: false
    }),
    created() {
      // Print any error in an alert component
      context.pryv.setErrorHandler(err => {
        return this.err = JSON.stringify(err);
      });
    },
    methods: {
      async submit () {
        if (this.$refs.form.validate()) {
  
          // Convert email to Pryv username if needed
          if (this.username.search('@') > 0) {
            this.username = await context.pryv.getUsernameForEmail(this.username);
          }

          // Login against Pryv
          this.personalToken = await context.pryv.login(this.username, this.password);

          // Check for existing app access
          const permissionsArray = JSON.parse(this.permissionsArray);
          const checkApp = await context.pryv.checkAppAccess(this.username, permissionsArray, this.personalToken);

          if (checkApp.mismatch) {
            return this.err = 'Mismatching access already exists: ' + JSON.stringify(checkApp.mismatch);
          }

          if (checkApp.match) {
            return this.err = 'Matching access already exists: ' + JSON.stringify(checkApp.match);
          }
          this.checkedPermissions = checkApp.permissions;
        }
      },
      // The user accepts the requested permissions
      async accept () {
        // Create a new app access
        this.appToken = await context.pryv.createAppAccess(this.username, this.checkedPermissions, this.personalToken);

        const state = {
          status: 'ACCEPTED',
          username: this.username,
          token: this.appToken,
        };
        // Advertise for accepted auth state
        await context.pryv.updateAuthState(this.pollKey, state);
        this.endPopup(state, this.pollKey);
      },
      // The user refuses the requested permissions
      async refuse () {
        const state = {
          status: 'REFUSED',
          reasonId: 'REFUSED_BY_USER',
          message: 'The user refused to give access to the requested permissions',
        };
        // Advertise for refused auth state
        await context.pryv.updateAuthState(this.pollKey, state);
        this.endPopup(state, this.pollKey);
      },
      // Closing the auth page
      endPopup (state, pollKey) {
        let href = context.settings.returnURL;
        // If a return URL was provided, we need to redirect to it,
        // passing the resulting parameters as querystring
        if (href) {
          if(context.settings.oauth) {
            href += '?state=' + context.settings.oauth +
                '&code=' + pollKey;
          }
          else {
            href += '?prYvkey=' + pollKey;
            Object.keys(state).forEach(function(key) {
              href += '&prYv' + key + '=' + state[key];
            });
          }
          this.$router.push(href);
        }
        // Otherwise just close the popup
        else {
          window.close();
        }
      }
    }
  }
</script>