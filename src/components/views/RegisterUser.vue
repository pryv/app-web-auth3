<template>
  <v-form id="registerForm" ref="form" v-model="validForm">

    <v-alert
      :value="err"
      type="error"
      transition="scale-transition"
    >{{err}}</v-alert>

    <h1>Register a new user</h1>

    <v-text-field
      label="E-mail"
      id="email"
      v-model="email"
      :rules="[rules.required, rules.email]"
    ></v-text-field>

    <v-text-field
      label="Username"
      id="username"
      v-model="username"
      :rules="[rules.required]"
    ></v-text-field>
    
    <Password v-model="password" :confirmation="true"></Password>

    <v-autocomplete
      label="Hosting"
      id="hosting"
      v-model="hosting"
      :items="hosts"
      placeholder="Choose hosting..."
      :rules="[rules.required]"
    ></v-autocomplete>

    <div>
      By registering you agree with our
      <a target="_blank" href="https://pryv.com/terms-of-use/">terms of use</a>.
    </div>
    
    <v-btn
      id="submitButton"
      @click="submit"
      :disabled="!validForm"
    >Submit</v-btn>

    <v-btn
      id="clearButton"
      @click="clear"
    >Clear</v-btn>

    <router-link :to="{ name: 'Authorization' }">Already a Pryv user ? Sign in.</router-link>

  </v-form>
</template>

<script>
  import Password from './bits/Password.vue';
  import Pryv from '../models/Pryv.js';
  import context from '../../context.js';

  export default {
    components: {
      Password,
    },
    data: () => ({
      username: '',
      password: '',
      email: '',
      hosting: '',
      hosts: [],
      err: '',
      rules: {
        required: value => !!value || 'This field is required.',
        email: value => /.+@.+/.test(value) || 'E-mail must be valid.'
      },
      validForm: false
    }),
    async created() {
      context.pryv.setErrorHandler(err => {
        return this.err = JSON.stringify(err);
      });
      this.hosts = await context.pryv.getAvailableHostings();
    },
    methods: {
      async submit () {
        if (this.$refs.form.validate()) {
          await context.pryv.createUser(
            this.username,
            this.password,
            this.email,
            this.hosting
          );
          this.$router.push('auth');
        }
      },
      clear () {
        this.$refs.form.reset()
      }
    }
  }
</script>