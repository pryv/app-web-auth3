<template>
  <div v-if="reset">
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
  import ErrorsHandling from '../controllers/ErrorsHandling';

  export default {
    components: {
      Password,
      NavigationButton
    },
    props: ['resetToken'],
    data: () => ({
      username: '',
      password: '',
      err: '',
      reset: false,
      rules: {
        required: value => !!value || 'This field is required.'
      },
      validForm: false
    }),
    methods: {
      async submit () {
        if (this.$refs.form.validate()) {
          const pryv = new Pryv('pryv.me', this.username, 'app-web-auth');
          try {
            if (this.resetToken) {
              const res = await pryv.changePassword(this.username, this.password, this.resetToken);
              console.log(JSON.stringify(res));
            }
            else {
              const res = await pryv.requestPasswordReset(this.username);
              if(res.status === 200) this.reset = true;
            }
          } catch(err) {
            console.error(err);
            this.err = JSON.stringify(err);
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