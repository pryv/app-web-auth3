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

  export default {
    components: {
      Password,
    },
    props: ['resetToken', 'appId', 'pryvDomain', 'language', 'returnURL'],
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
    created() {
      this.pryv = new Pryv('pryv.me', 'pryv-reset-standalone');
    },
    methods: {
      async submit () {
        if (this.$refs.form.validate()) {

          if (this.username.search('@') > 0) {
            [this.err, this.username] = await this.pryv.getUsernameForEmail(this.username);
          }

          if (this.resetToken) {
            [this.err] = await this.pryv.changePassword(this.username, this.password, this.resetToken);
          }
          else {
            [this.err, this.resetStatus] = await this.pryv.requestPasswordReset(this.username);
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