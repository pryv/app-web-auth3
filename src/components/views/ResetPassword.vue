<template>
  <div>
    <h1>{{ pageTitle }}</h1>

    <v-form
      v-if="resetStatus!==200 && changeStatus!==200"
      ref="form"
      v-model="validForm">

      <v-text-field
        id="usernameOrEmail"
        v-model="username"
        :rules="[rules.required]"
        label="Username or email"/>

      <Password
        v-if="resetToken!=null"
        v-model="password"
        :confirmation="true"/>

      <v-btn
        id="submitButton"
        :disabled="!validForm"
        @click="submit"
      >{{ buttonText }}</v-btn>
    </v-form>

    <v-divider class="mt-3 mb-2"/>

    <router-link :to="{ name: 'Authorization' }"><h3>Go back to Sign in</h3></router-link>

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

export default {
  components: {
    Password,
    Alerts,
  },
  props: {
    resetToken: {type: String, default: null},
  },
  data: () => ({
    username: '',
    password: '',
    error: '',
    success: '',
    resetStatus: null,
    changeStatus: null,
    ctx: {},
    c: null,
    rules: {
      required: value => !!value || 'This field is required.',
    },
    validForm: false,
  }),
  computed: {
    pageTitle: function () {
      return this.resetToken ? 'Set a new password' : 'Reset password';
    },
    buttonText: function () {
      return this.resetToken ? 'Change password' : 'Request password reset';
    },
  },
  async created () {
    this.ctx = new Context(this.$route.query);
    this.c = controllerFactory(this.ctx, this.showError);
  },
  methods: {
    async submit () {
      if (this.$refs.form.validate()) {
        // Ask for a reset token
        if (this.resetToken == null) {
          this.resetStatus = await this.c.resetPassword(this.username);
          if (this.resetStatus === 200) {
            this.success = 'We have sent password reset instructions to your e-mail address.';
          };
        } else {
          // If we already got a reset token, we can change the password
          this.changeStatus = await this.c.changePassword(this.username, this.password, this.resetToken);
          if (this.changeStatus === 200) {
            this.success = 'Your password have been successfully changed.';
          }
        }
      }
    },
    showError (error) {
      this.error = error;
    },
  },
};
</script>
