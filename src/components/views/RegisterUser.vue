<template>
  <div>
    <h1>Register a new user</h1>

    <v-form
      id="registerForm"
      ref="form"
      v-model="validForm">

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
        :items="hostingsSelection"
        :rules="[rules.required]"
        placeholder="Choose hosting..."
        label="Hosting"
      />

      <v-btn
        id="submitButton"
        :disabled="!validForm"
        @click="submit"
      >Create</v-btn>

      <v-btn
        id="clearButton"
        @click="clear"
      >Clear</v-btn>

      <div>
        By registering you agree with our
        <a
          target="_blank"
          href="https://pryv.com/terms-of-use/">
        terms of use</a>.
      </div>
    </v-form>

    <v-divider class="mt-3 mb-2"/>
    <router-link :to="{ name: 'Authorization' }"><h3>Go back to Sign in</h3></router-link>

    <v-divider class="mt-3 mb-2"/>

    <v-alert
      :value="alert.msg"
      :type="alert.type"
      transition="scale-transition"
    >{{ alert.msg }}</v-alert>
  </div>
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
    hostingsSelection: [],
    alert: {
      msg: '',
      type: 'error',
    },
    rules: {
      required: value => !!value || 'This field is required.',
      email: value => /.+@.+/.test(value) || 'E-mail must be valid.',
    },
    validForm: false,
  }),
  async created () {
    // Fill selector with available hostings
    try {
      const hostings = await Context.pryv.getAvailableHostings();
      this.hostingsSelection = hostings.getSelection();
    } catch (err) {
      this.throwError(err);
    }
  },
  methods: {
    async submit () {
      if (this.$refs.form.validate()) {
        try {
          // Create the new user
          const newUser = await Context.pryv.createUser(
            this.username,
            this.password,
            this.email,
            this.hosting
          );
          // Go back to auth page
          this.$router.push({name: 'Authorization', params: { user: newUser }});
        } catch (err) {
          this.throwError(err);
        }
      }
    },
    clear () {
      this.$refs.form.reset();
    },
    throwError (error) {
      this.alert.type = 'error';
      this.alert.msg = JSON.stringify(error);
      console.log(error);
    },
  },
};
</script>
