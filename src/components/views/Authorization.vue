<template>
  <div>
    <h1>Sign in</h1>

    <Permissions
      v-if="checkedPermissions!=null"
      :appId="ctx.appId"
      :permissionsList="checkedPermissions"
      @accepted="accept"
      @refused="refuse"/>

    <v-form
      ref="form"
      v-model="validForm"
      @submit.prevent>

      <v-text-field
        id="usernameOrEmail"
        v-model="ctx.user.username"
        :rules="[rules.required]"
        label="Username or email"/>

      <Password v-model="password"/>

      <v-btn
        id="submitButton"
        :disabled="!validForm||submitting"
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
import Context from '../../context.js';
import controllerFactory from '../controller/controller.js';

export default {
  components: {
    Password,
    Permissions,
    Alerts,
  },
  data: () => ({
    password: '',
    personalToken: '',
    error: '',
    checkedPermissions: null,
    accessId: null,
    serviceInfos: {},
    submitting: false,
    c: null,
    ctx: {},
    rules: {
      required: value => !!value || 'This field is required.',
      email: value => /.+@.+/.test(value) || 'E-mail must be valid',
    },
    validForm: false,
  }),
  created () {
    this.ctx = new Context(this.$route.query);
    this.c = controllerFactory(this.ctx);
    this.c.getServiceInfo()
      .then(this.showInfos)
      .catch(this.showError);
  },
  methods: {
    submit () {
      if (this.$refs.form.validate()) {
        this.submitting = true;
        // Check for existing app access
        this.c.checkAccess(this.password, this.showPermissions)
          .catch(this.showError)
          .finally(() => { this.submitting = false; });
      }
    },
    // Print requested permissions to the user
    showPermissions (accessId) {
      this.checkedPermissions = this.ctx.permissions.list;
      this.accessId = accessId;
    },
    // The user accepts the requested permissions
    accept () {
      this.c.acceptAccess(this.accessId)
        .catch(this.showError);
    },
    // The user refuses the requested permissions
    refuse () {
      this.c.refuseAccess()
        .catch(this.showError);
    },
    showError (error) {
      this.error = error.msg;
    },
    showInfos (infos) {
      this.serviceInfos = infos;
    },
  },
};
</script>
