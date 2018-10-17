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
import Context from '../../Context.js';

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
            if (this.resetStatus === 200) {
              this.success = 'We have sent password reset instructions to your e-mail address.';
            }
          } else {
            // If we already got a reset token, we can change the password
            this.changeStatus = await Context.pryv.changePassword(this.username, this.password, this.resetToken);
            if (this.changeStatus === 200) {
              this.success = 'Your password have been successfully changed.';
            }
          }
        }
      } catch (err) {
        this.throwError(err);
      }
    },
    throwError (error) {
      this.error = JSON.stringify(error);
      console.log(error);
    },
  },
};
</script>
