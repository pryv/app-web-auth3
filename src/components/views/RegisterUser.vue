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

  </v-form>
</template>

<script>
import Password from './bits/Password.vue';
import Pryv from '../models/Pryv.js';

export default {
  components: {
    Password,
  },
  props: {
    domain: {type: String, default: null},
    appId: {type: String, default: null},
    end: {type: Function, default: null},
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
    this.pryv = new Pryv(this.domain, this.appId, err => {
      this.err = JSON.stringify(err);
    });

    // Fill selector with available hostings
    this.hosts = await this.pryv.getAvailableHostings();
  },
  methods: {
    async submit () {
      if (this.$refs.form.validate()) {
        // Create the new user
        await this.pryv.createUser(
          this.username,
          this.password,
          this.email,
          this.hosting
        );

        if (this.err == null) {
          // Go back to auth page
          this.$emit('end', 'auth');
        }
      }
    },
    clear () {
      this.$refs.form.reset();
    },
  },
};
</script>
