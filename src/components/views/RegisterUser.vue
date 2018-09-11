<template>
  <v-form ref="form" v-model="validForm">
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
    
    <Password :confirmation="true"></Password>

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

    <NavigationButton
      :title="'Already a Pryv user ? Sign in.'"
      :page="'auth'"
    ></NavigationButton>

  </v-form>
</template>

<script>
  import Password from './bits/Password.vue';
  import NavigationButton from './bits/NavigationButton.vue';
  import Hostings from '../models/Hostings.js';

  export default {
    components: {
      Password,
      NavigationButton
    },
    data: () => ({
      email: '',
      username: '',
      hosting: '',
      hosts: [],
      rules: {
        required: value => !!value || 'This field is required.',
        email: value => /.+@.+/.test(value) || 'E-mail must be valid.'
      },
      validForm: false
    }),
    async created() {
      const hostings = new Hostings();
      await hostings.syncHostings();
      this.hosts = Object.keys(hostings.getHostings());
    },
    methods: {
      submit () {
        if (this.$refs.form.validate()) {
          alert('Submit form...')
        }
      },
      clear () {
        this.$refs.form.reset()
      }
    }
  }
</script>