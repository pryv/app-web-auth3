<template>
  <div>
    <h1>{{ pageTitle }}</h1>

    <v-form
      v-if="showForm"
      ref="form"
      v-model="validForm"
      @submit.prevent>

      <v-text-field
        id="usernameOrEmail"
        v-model="ctx.user.username"
        :rules="[rules.required]"
        :label="$t('usernameOrEmail')"/>

      <Password
        v-if="resetToken!=null"
        v-model="password"
        :confirmation="true"/>

      <v-btn
        id="submitButton"
        :disabled="!validForm||submitting"
        @click="submit"
      >{{ buttonText }}</v-btn>
    </v-form>

    <div v-if="ctx.permissions.list != null">
      <v-divider class="mt-3 mb-2"/>
      <router-link :to="{ name: 'Authorization' }"><h3>{{ $t('backToSignin') }}</h3></router-link>
    </div>

    <Alerts
      :successMsg="success"
      :errorMsg="error"/>
  </div>
</template>

<script>
import Password from './bits/Password';
import Alerts from './bits/Alerts';
import Context from '../../context.js';
import controllerFactory from '../controller/controller.js';
import { i18n } from '../../locals/i18n.js';

export default {
  components: {
    Password,
    Alerts,
  },
  props: {
    resetToken: {type: String, default: null},
  },
  data: () => ({
    password: '',
    error: '',
    success: '',
    showForm: true,
    submitting: false,
    ctx: {},
    c: null,
    rules: {
      required: value => !!value || i18n.t('requireField'),
    },
    validForm: false,
  }),
  computed: {
    pageTitle: function () {
      return this.resetToken ? i18n.t('setNewPass') : i18n.t('resetPass');
    },
    buttonText: function () {
      return this.resetToken ? i18n.t('changePass') : i18n.t('requestResetPass');
    },
  },
  created () {
    this.ctx = new Context(this.$route.query);
    this.c = controllerFactory(this.ctx);
  },
  methods: {
    submit () {
      if (this.$refs.form.validate()) {
        this.submitting = true;
        // Ask for a reset token
        if (this.resetToken == null) {
          this.c.resetPassword()
            .then(() => {
              this.showForm = false;
              this.success = i18n.t('resetInstructions');
            })
            .catch(this.showError)
            .finally(() => { this.submitting = false; });
        } else {
          // If we already got a reset token, we can change the password
          this.c.changePassword(this.password, this.resetToken)
            .then(() => {
              this.showForm = false;
              this.success = i18n.t('passwordChanged');
            })
            .catch(this.showError)
            .finally(() => { this.submitting = false; });
        }
      }
    },
    showError (error) {
      this.error = error.msg;
    },
  },
};
</script>
