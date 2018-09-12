<template>
  <v-form ref="form" v-model="validForm">
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

    <NavigationButton
      :title="'Go back to Sign in.'"
      :page="'auth'"
    ></NavigationButton>

  </v-form>
</template>

<script>
  import Password from './bits/Password';
  import NavigationButton from './bits/NavigationButton';
  import Pryv from '../models/Pryv';

  export default {
    components: {
      Password,
      NavigationButton
    },
    props: ['resetToken'],
    data: () => ({
      username: '',
      password: '',
      rules: {
        required: value => !!value || 'This field is required.'
      },
      validForm: false
    }),
    methods: {
      submit () {
        if (this.$refs.form.validate()) {
          const pryv = new Pryv('reg.pryv.me', 'pryv.me', this.username);
          if (this.resetToken) {
            pryv.changePassword(this.username, this.password, this.resetToken);
          } else {
            pryv.requestPasswordReset(this.username);
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