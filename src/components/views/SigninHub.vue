<template>
  <div>
    <h1>{{ $t('signinHub') }}</h1>

    <v-form
      ref="form"
      v-model="validForm"
      @submit.prevent>

      <v-text-field
        id="usernameOrEmail"
        v-model="ctx.user.username"
        :rules="[rules.required]"
        :label="$t('usernameOrEmail')"/>

      <v-btn
        id="submitButton"
        :disabled="!validForm"
        @click="submit"
      >{{ $t('goToPryv') }}</v-btn>

    </v-form>

    <v-divider class="mt-3 mb-2"/>
    <router-link :to="{ name: 'RegisterUser' }"><h3>{{ $t('newToPryv') }}</h3></router-link>

    <Alerts
      :errorMsg="error"/>
  </div>
</template>

<script>
import Alerts from './bits/Alerts';
import Context from '../../context.js';
import controllerFactory from '../controller/controller.js';
import { i18n } from '../../locals/i18n.js';

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
      required: value => !!value || i18n.t('requireField'),
    },
    validForm: false,
  }),
  created () {
    this.ctx = new Context(this.$route.query);
    this.c = controllerFactory(this.ctx);
  },
  methods: {
    submit () {
      if (this.$refs.form.validate()) {
        this.c.checkUsername()
          .then(this.toMyPryv)
          .catch(this.showError);
      }
    },
    toMyPryv () {
      location.href = this.ctx.pryv.core(this.ctx.user.username);
    },
    showError (error) {
      this.error = error.msg;
    },
  },
};
</script>
