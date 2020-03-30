<template>
  <div>
    <h1>Register a new user</h1>

    <v-form
      v-if="newUser==null"
      id="registerForm"
      ref="form"
      v-model="validForm"
      @submit.prevent>

      <v-text-field
        id="email"
        v-model="email"
        :rules="[rules.required, rules.email]"
        label="E-mail"
      />

      <v-text-field
        id="username"
        v-model="ctx.user.username"
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
        :disabled="!validForm||submitting"
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
    <div v-if="ctx.isAccessRequest()">
      <v-divider class="mt-3 mb-2"/>
      <router-link :to="{ name: 'Authorization' }"><h3>Go to Sign in</h3></router-link>
    </div>

    <Alerts
      :successMsg="success"
      :errorMsg="error"/>
  </div>
</template>

<script>
import Password from './bits/Password.vue';
import Alerts from './bits/Alerts.vue';
import Context from '../../context.js';
import controllerFactory from '../controller/controller.js';

export default {
  components: {
    Password,
    Alerts,
  },
  data: () => ({
    password: '',
    email: '',
    hosting: '',
    hostingsSelection: [],
    newUser: null,
    submitting: false,
    ctx: {},
    c: null,
    error: '',
    success: '',
    rules: {
      required: value => !!value || 'This field is required.',
      email: value => /.+@.+/.test(value) || 'E-mail must be valid.',
    },
    validForm: false,
  }),
  async created () {
    this.ctx = new Context(this.$route.query);
    await this.ctx.init();
    this.c = controllerFactory(this.ctx);
    // Fill selector with available hostings, preselect first one
    this.c.loadHostings()
      .then(this.initHostings)
      .catch(this.showError);
  },
  methods: {
    submit () {
      if (this.$refs.form.validate()) {
        this.submitting = true;
        this.c.createUser(this.password, this.email, this.hosting)
          .then((newUser) => {
            this.newUser = newUser;
            this.success = `New user successfully created: ${newUser.username}.`;
            if (this.ctx.isAccessRequest()) {
              location.href = this.ctx.pryv.core(newUser.username);
            }
          })
          .catch(this.showError)
          .finally(() => { this.submitting = false; });
      }
    },
    clear () {
      this.$refs.form.reset();
    },
    initHostings (hostings) {
      this.hostingsSelection = hostings;
      if (this.hostingsSelection.length > 0) {
        this.hosting = this.hostingsSelection[0].value;
      }
    },
    showError (error) {
      this.error = error.msg;
    },
  },
};
</script>
