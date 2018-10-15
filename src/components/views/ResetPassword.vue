<template>
  <div v-if="resetStatus===200">
    We have sent you a reset link by email.
  </div>

  <v-form
    v-else
    ref="form"
    v-model="validForm">

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

    <router-link :to="{ name: 'Authorization' }">Go back to Sign in.</router-link>

    <v-alert
      :value="err"
      type="error"
      transition="scale-transition"
    >{{ err }}</v-alert>

  </v-form>
</template>

<script>
import Password from './bits/Password';
import Context from '../../Context.js';

export default {
  components: {
    Password,
  },
  props: {
    resetToken: {type: String, default: null},
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
  methods: {
    async submit () {
      try {
        if (this.$refs.form.validate()) {
          // Convert email to Pryv username if needed
          this.username = await Context.pryv.getUsernameForEmail(this.username);

          // Ask for a reset token
          if (this.resetToken == null) {
            this.resetStatus = await Context.pryv.requestPasswordReset(this.username);
          } else {
            // If we already got a reset token, we can change the password
            await Context.pryv.changePassword(this.username, this.password, this.resetToken);
          }
        }
      } catch (err) {
        this.err = JSON.stringify(err);
      }
    },
  },
};
</script>
