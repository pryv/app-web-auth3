<template>
  <div>
    <h1>Signin hub</h1>

    <v-form
      ref="form"
      v-model="validForm"
      @submit.prevent>

      <v-text-field
        id="usernameOrEmail"
        v-model="ctx.user.username"
        :rules="[rules.required]"
        label="Username or email"/>

      <v-btn
        id="submitButton"
        :disabled="!validForm"
        @click="submit"
      >Go to my homepage</v-btn>

    </v-form>

    <v-divider class="mt-3 mb-2"/>
    <router-link :to="{ name: 'RegisterUser' }"><h3>New to {{ serviceInfo.name }} ? Create an account</h3></router-link>

    <Alerts
      :errorMsg="error"/>
  </div>
</template>

<script>
import Alerts from './bits/Alerts';
import Context from '../../context.js';
import controllerFactory from '../controller/controller.js';

export default {
  components: {
    Alerts,
  },
  data: () => ({
    username: '',
    error: '',
    ctx: {},
    c: null,
    rules: {
      required: value => !!value || 'This field is required.',
    },
    validForm: false,
    serviceInfo: { name: '' },
  }),
  async created () {
    this.ctx = new Context(this.$route.query);
    await this.ctx.init();
    this.c = controllerFactory(this.ctx);
    this.serviceInfo = await this.ctx.pryvService.info();
  },
  methods: {
    submit () {
      this.ctx.user.username = this.ctx.user.username.trim();
      if (this.$refs.form.validate()) {
        this.c.checkUsername()
          .then(this.toMyPryv)
          .catch(this.showError);
      }
    },
    toMyPryv () {
      location.href = this.ctx.pryvService.apiEndpointForSync(this.ctx.user.username);
    },
    showError (error) {
      this.error = error.msg;
    },
  },
};
</script>
