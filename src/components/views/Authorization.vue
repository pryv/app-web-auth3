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
      personalToken: '',
      appToken: '',
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

          [this.err, this.personalToken] = await this.pryv.login(this.username, this.password);

          let checkApp;
          const permissionsArray = JSON.parse(this.permissionsArray);
          [this.err, checkApp] = await this.pryv.checkAppAccess(this.username, permissionsArray, this.personalToken);

          if (checkApp.mismatch) {
            return this.err = 'Mismatching access already exists: ' + JSON.stringify(checkApp.mismatch);
          }

          if (checkApp.match) {
            return this.err = 'Matching access already exists: ' + JSON.stringify(checkApp.match);
          }

          this.checkedPermissions = checkApp.permissions;
        }
      },

      async accept () {
        [this.err, this.appToken] = await this.pryv.createAppAccess(this.username, this.checkedPermissions, this.personalToken);

        [this.err] = await this.pryv.updateAuthState(this.pollKey, {
          status: 'ACCEPTED',
          username: this.username,
          token: appToken,
        });
      },

      async refuse () {
        [this.err] = await this.pryv.updateAuthState(this.pollKey, {
          status: 'REFUSED',
          reasonId: 'REFUSED_BY_USER',
          message: 'The user refused to give access to the requested permissions',
        });
      }
    }
  }
</script>