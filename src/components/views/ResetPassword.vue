<template>
  <div v-if="resetStatus===200">
    We have sent you a reset link by email.
  </div>
  <v-form ref="form" v-model="validForm" v-else>

    <v-alert
      :value="err"
      type="error"
      transition="scale-transition"
    >{{err}}</v-alert>

    <h1>{{pageTitle}}</h1>

    <v-text-field
      id="usernameOrEmail"
      label="Username or email"
      v-model="username"
      :rules="[rules.required]"
    ></v-text-field>

    <Password v-model="password" :confirmation="true" v-if="resetToken"></Password>

    <v-btn
      id="submitButton"
      @click="submit"
      :disabled="!validForm"
    >{{buttonText}}</v-btn>

    <router-link :to="{ name: 'Authorization' }">Go back to Sign in.</router-link>

  </v-form>
</template>

<script>
  import Password from './bits/Password';
  import Pryv from '../models/Pryv';
  import context from '../../context.js';

  export default {
    components: {
      Password,
    },
    props: ['resetToken'],
    data: () => ({
      username: '',
      password: '',
      err: '',
      resetStatus: null,
      rules: {
        required: value => !!value || 'This field is required.'
      },
      validForm: false
    }),
    async created() {
      context.pryv.setErrorHandler(err => {
        return this.err = err;
      });
    },
    methods: {
      async submit () {
        if (this.$refs.form.validate()) {

          if (this.username.search('@') > 0) {
            this.username = await context.pryv.getUsernameForEmail(this.username);
          }

          if (this.resetToken) {
            await context.pryv.changePassword(this.username, this.password, this.resetToken);
          }
          else {
            this.resetStatus = await context.pryv.requestPasswordReset(this.username);
          }
        }
      }
    },
    computed: {
      pageTitle: function() {
        return this.resetToken ? 'Set a new password' : 'Reset password';
      },
      buttonText: function() {
        return this.resetToken ? 'Change password' : 'Request password reset';
      }
    }
  }
</script>