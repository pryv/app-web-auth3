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
        :label="$t('usernameOrEmail')"/>

      <Password v-model="password"/>

      <v-btn
        id="submitButton"
        :disabled="!validForm||submitting"
        @click="submit"
      >{{ $t('signin') }}</v-btn>

      <v-btn
        @click="refuse"
      >{{ $t('cancel') }}</v-btn>

      <div v-if="serviceInfos.support">
        {{ $t('reachUs1') }}
        <a
          :href="serviceInfos.support"
          target="_blank">
          helpdesk</a>
        {{ $t('reachUs2') }}
      </div>
    </v-form>

    <v-divider class="mt-3 mb-2"/>

    <router-link :to="{ name: 'RegisterUser' }"><h3>{{ $t('register') }}</h3></router-link>

    <router-link :to="{ name: 'ResetPassword' }"><h3>{{ $t('forgotPass') }}</h3></router-link>

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
import { i18n } from '../../locals/i18n.js';

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
      required: value => !!value || i18n.t('requireField'),
      email: value => /.+@.+/.test(value) || i18n.t('invalidEmail'),
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
