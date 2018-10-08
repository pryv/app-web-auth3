<template>
  <div v-if="resetStatus===200">
    We have sent you a reset link by email.
  </div>

  <v-form
    v-else
    ref="form"
    v-model="validForm">

    <v-alert
      :value="err"
      type="error"
      transition="scale-transition"
    >{{ err }}</v-alert>

    <h1>{{ pageTitle }}</h1>

    <v-text-field
      id="usernameOrEmail"
      v-model="username"
      :rules="[rules.required]"
      label="Username or email"/>

    <Password
      v-if="resetToken"
      v-model="password"
      :confirmation="true"/>

    <v-btn
      id="submitButton"
      :disabled="!validForm"
      @click="submit"
    >{{ buttonText }}</v-btn>

  </v-form>
</template>

<script>
import Password from './bits/Password';
import Pryv from '../models/Pryv.js';

export default {
  components: {
    Password,
  },
  props: {
    resetToken: {type: String, default: null},
    domain: {type: String, default: null},
    appId: {type: String, default: null},
  },
  data: () => ({
    username: '',
    password: '',
    err: '',
    resetStatus: null,
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
  created () {
    this.pryv = new Pryv(this.domain, this.appId, err => {
      this.err = err;
    });
  },
  methods: {
    async submit () {
      if (this.$refs.form.validate()) {
        // Convert email to Pryv username if needed
        if (this.username.search('@') > 0) {
          this.username = await this.pryv.getUsernameForEmail(this.username);
        }

        // If we already got a reset token, we can change the password
        if (this.resetToken) {
          await this.pryv.changePassword(this.username, this.password, this.resetToken);
        } else {
          // Ask for a reset token
          this.resetStatus = await this.pryv.requestPasswordReset(this.username);
        }
      }
    },
  },
};
</script>
