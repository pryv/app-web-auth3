<template>
  <v-form
    id="registerForm"
    ref="form"
    v-model="validForm">

    <v-alert
      :value="err"
      type="error"
      transition="scale-transition"
    >{{ err }}</v-alert>

    <h1>Register a new user</h1>

    <v-text-field
      id="email"
      v-model="email"
      :rules="[rules.required, rules.email]"
      label="E-mail"
    />

    <v-text-field
      id="username"
      v-model="username"
      :rules="[rules.required]"
      label="Username"
    />

    <Password
      v-model="password"
      :confirmation="true"/>

    <v-autocomplete
      id="hosting"
      v-model="hosting"
      :items="hosts"
      :rules="[rules.required]"
      placeholder="Choose hosting..."
      label="Hosting"
    />

    <div>
      By registering you agree with our
      <a
        target="_blank"
        href="https://pryv.com/terms-of-use/">
      terms of use</a>.
    </div>

    <v-btn
      id="submitButton"
      :disabled="!validForm"
      @click="submit"
    >Submit</v-btn>

    <v-btn
      id="clearButton"
      @click="clear"
    >Clear</v-btn>

    <router-link :to="{ name: 'Authorization' }">Go back to Sign in.</router-link>

  </v-form>
</template>

<script>
import Password from './bits/Password.vue';
import Context from '../../Context.js';

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
    err: null,
    rules: {
      required: value => !!value || 'This field is required.',
      email: value => /.+@.+/.test(value) || 'E-mail must be valid.',
    },
    validForm: false,
  }),
  async created () {
    // Fill selector with available hostings
    try {
      this.hosts = await Context.pryv.getAvailableHostings();
    } catch (err) {
      this.err = JSON.stringify(err);
    }
  },
  methods: {
    async submit () {
      if (this.$refs.form.validate()) {
        try {
          // Create the new user
          await Context.pryv.createUser(
            this.username,
            this.password,
            this.email,
            this.hosting
          );
          // Go back to auth page
          this.$router.push('auth');
        } catch (err) {
          this.err = JSON.stringify(err);
        }
      }
    },
    clear () {
      this.$refs.form.reset();
    },
  },
};
</script>
