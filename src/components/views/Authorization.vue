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
      :permissionsArray="permissionsArray"
      :accept="accept"
      :refuse="refuse"
    ></Permissions>

    <v-form ref="form" v-model="validForm" v-else>

      <h1>Sign in</h1>

      <v-text-field
        label="Username or email"
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
      
      <NavigationButton
        :title="'Create an account'"
        :page="'register'"
      ></NavigationButton>

      <NavigationButton
        :title="'Forgot password'"
        :page="'reset'"
      ></NavigationButton>

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
  import NavigationButton from './bits/NavigationButton.vue';
  import Permissions from './bits/Permissions.vue';
  import Pryv from '../models/Pryv.js';

  export default {
    components: {
      Password,
      NavigationButton,
      Permissions
    },
    props: ['pollKey', 'permissionsArray', 'appId'],
    data: () => ({
      username: '',
      password: '',
      personalToken: null,
      err: '',
      checkedPermissions: null,
      rules: {
        required: value => !!value || 'This field is required.',
        email: value => /.+@.+/.test(value) || 'E-mail must be valid'
      },
      validForm: false
    }),
    async created() {
      this.pryv = new Pryv('pryv.me', 'pryv-reg-standalone');
    },
    methods: {
      async submit () {
        if (this.$refs.form.validate()) {
          try {
          const login = await this.pryv.login(this.username, this.password);
          this.personalToken = login.data.token;
          const checkApp = await this.pryv.checkAppAccess(this.username, this.permissionsArray, this.personalToken);
          const mismatchingAccess = checkApp.data.mismatchingAccess;
          const matchingAccess = checkApp.data.matchingAccess;
          if (mismatchingAccess) {
            return this.err = 'Mismatching access already exists: ' + JSON.stringify(mismatchingAccess);
          }
          if (matchingAccess) {
            return this.err = 'Matching access already exists: ' + JSON.stringify(matchingAccess);
          }
          this.checkedPermissions = checkApp.data.checkedPermissions;
          } catch(err) {
            console.error(err);
            this.err = JSON.stringify(err.response.data);
          }
        }
      },
      async accept () {
        try {
          const createAccess = await this.pryv.createAppAccess(this.username, this.checkedPermissions, this.personalToken);
          const appToken = createAccess.data.token;
          await this.pryv.updateAuthState(this.pollKey, {
            status: 'ACCEPTED',
            username: this.username,
            token: appToken,
          });
        } catch(err) {
          console.error(err);
          this.err = JSON.stringify(err.response.data);
        }
      },
      async refuse () {
        return this.err = 'Requested permissions were refused by user!';
      }
    }
  }
</script>