<template>
  <div>
    <h1>Sign in</h1>

    <Permissions
      v-if="checkedPermissions!=null"
      :appId="ctx.requestingAppId"
      :permissionsList="checkedPermissions"
      :clientData="ctx.clientData"
      @accepted="accept"
      @refused="refuse"/>

    <!--v-model below may be replaced by v-if-->
    <v-dialog
      v-model="mfaActivated"
      persistent
      width="600">
      <v-card>
        <v-card-title class="headline grey lighten-2">MFA verification</v-card-title>
        <v-text-field
          id="mfaCode"
          v-model="mfaCode"
          :rules="[rules.required]"
          class="ma-3"
          label="MFA code"/>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            @click="ctx.user.mfaToken = ''; mfaCode = ''">Cancel</v-btn>
          <v-btn
            @click="handleMFA()">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
    mfaToken: '',
    mfaCode: '',
    error: '',
    checkedPermissions: null,
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
  computed: {
    mfaActivated: {
      get: function () {
        return this.ctx.user.mfaToken !== '';
      },
    },
  },
  async created () {
    this.ctx = new Context(this.$route.query);
    await this.ctx.init();
    this.c = controllerFactory(this.ctx);
    this.c.getServiceInfo()
      .then(this.showInfos)
      .catch(this.showError);
  },
  methods: {
    async submit () {
      if (this.$refs.form.validate()) {
        this.submitting = true;
        try {
          await this.c.login(this.password);
          if (!this.mfaActivated) {
            await this.c.checkAccess(this.showPermissions);
          }
        } catch (err) {
          this.showError(err);
        } finally {
          this.submitting = false;
        }
      }
    },
    // Handle provided MFA code
    async handleMFA () {
      try {
        await this.c.mfaVerify(this.mfaCode);
        await this.c.checkAccess(this.showPermissions);
      } catch (err) {
        this.showError(err);
      } finally {
        this.ctx.user.mfaToken = '';
      }
    },
    // Print requested permissions to the user
    showPermissions () {
      this.checkedPermissions = this.ctx.permissions.list;
    },
    // The user accepts the requested permissions
    accept () {
      this.c.acceptAccess()
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
