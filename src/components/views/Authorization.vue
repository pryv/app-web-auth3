<template>
  <div>
    <v-alert
      :value="err"
      type="error"
      transition="scale-transition"
    >{{err}}</v-alert>

    <Permissions
      v-if="permissionsList"
      :appId="appId"
      :permissionsList="permissionsList"
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
  import Context from '../../Context.js'
  import {AcceptedAuthState, RefusedAuthState} from '../models/AuthStates.js';

  export default {
    components: {
      Password,
      Permissions,
    },
    data: () => ({
      username: '',
      password: '',
      personalToken: '',
      appToken: '',
      err: '',
      permissionsList: null,
      appId: Context.appId,
      rules: {
        required: value => !!value || 'This field is required.',
        email: value => /.+@.+/.test(value) || 'E-mail must be valid'
      },
      validForm: false
    }),
    created() {
      // Print any error in an alert component
      Context.pryv.setErrorHandler(err => {
        return this.err = JSON.stringify(err);
      });
    },
    methods: {
      async submit () {
        if (this.$refs.form.validate()) {
  
          // Convert email to Pryv username if needed
          if (this.username.search('@') > 0) {
            this.username = await Context.pryv.getUsernameForEmail(this.username);
          }

          // Login against Pryv
          this.personalToken = await Context.pryv.login(this.username, this.password);

          // Check for existing app access
          const checkApp = await Context.pryv.checkAppAccess(this.username, Context.permissions.list, this.personalToken);

          // If a mismatching access exists, show an error
          if (checkApp.mismatch) {
            return this.err = 'Mismatching access already exists: ' + JSON.stringify(checkApp.mismatch);
          }

          // If a matching access exists, just return it
          if (checkApp.match) {
            return await this.closingFlow(new AcceptedAuthState(this.username, checkApp.match.token));
          }

          // Otherwise, show the requested permissions to the user
          this.permissionsList = Context.permissions.updateList(checkApp.permissions);
        }
      },
      // The user accepts the requested permissions
      async accept () {
        // Create a new app access
        this.appToken = await Context.pryv.createAppAccess(this.username, Context.permissions.list, this.personalToken);

        await this.closingFlow(new AcceptedAuthState(this.username, this.appToken));
      },
      // The user refuses the requested permissions
      async refuse () {
        await this.closingFlow(new RefusedAuthState());
      },
      // Advertise state and close
      async closingFlow(state) {
        await Context.pryv.updateAuthState(Context.pollKey, state);
        this.endPopup(state);
      },
      // Closing the auth page
      endPopup (state) {
        let href = Context.returnURL;
        // If no return URL was provided, just close the popup
        if (href == null || !href) {
          window.close();
        }
        // Otherwise, we need to redirect to the return URL,
        // passing the resulting parameters as querystring
        else {
          if(Context.oauth) {
            href += `?state=${Context.oauth}&code=${Context.pollKey}`;
          }
          else {
            href += `?prYvkey=${Context.pollKey}`;

            Object.keys(state.body).forEach(key => {
              href += `&prYv${key}=${state.body[key]}`;
            });
          }
          this.$router.push(href);
        }
      }
    }
  }
</script>