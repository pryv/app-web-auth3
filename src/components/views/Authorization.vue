<template>
  <div>
    <h1>Sign in</h1>

    <Permissions
      v-if="permissionsList!=null"
      :appId="appId"
      :permissionsList="permissionsList"
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
      :errorMsg="error"/>
  </div>
</template>

<script>
import Password from './bits/Password.vue';
import Permissions from './bits/Permissions.vue';
import Alerts from './bits/Alerts.vue';
import Context from '../../Context.js';
import controllerFactory from '../controller/controller.js';

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
    appId: Context.appId,
    error: '',
    permissionsList: null,
    updateId: null,
    serviceInfos: {},
    c: null,
    rules: {
      required: value => !!value || 'This field is required.',
      email: value => /.+@.+/.test(value) || 'E-mail must be valid',
    },
    validForm: false,
  }),
  async created () {
    this.c = controllerFactory({}, this.showError);
    this.serviceInfos = this.c.getServiceInfo();
  },
  methods: {
    async submit () {
      if (this.$refs.form.validate()) {
        // Login against Pryv
        this.personalToken = await this.c.login(this.username, this.password);
        // Check for existing app access
        await this.c.checkAccess(this.username, this.personalToken, this.showPermissions);
      }
    },
    // Print requested permissions to the user
    showPermissions (permissions, updateId) {
      this.permissionsList = permissions;
      this.updateId = updateId;
    },
    // The user accepts the requested permissions
    async accept () {
      await this.c.acceptAccess(this.username, this.permissionsList, this.personalToken, this.updateId);
    },
    // The user refuses the requested permissions
    async refuse () {
      await this.c.refuseAccess();
    },
    showError (error) {
      this.error = error;
    },
  },
};
</script>
