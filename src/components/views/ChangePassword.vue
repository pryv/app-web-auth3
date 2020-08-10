<template>
  <div>
    <h1>Change password</h1>
    <v-form
      v-if="showForm"
      ref="form"
      v-model="validForm"
      @submit.prevent>
      <v-text-field
        id="usernameOrEmail"
        v-model="ctx.user.username"
        :rules="[rules.required]"
        label="Username or email"/>
      <Password
        v-model="oldPassword"
        :confirmation="false"
        :id="'oldPassword'"
      />
      <Password
        v-model="newPassword"
        :confirmation="true"
        :label="'New password'"
        :id="'newPassword'"
      />
      <v-btn
        id="submitButton"
        :disabled="!validForm || submitting"
        @click="submit"
      >REQUEST PASSWORD CHANGE</v-btn
      >
    </v-form>
    <Alerts
      :successMsg="success"
      :errorMsg="error" />
  </div>
</template>

<script>
import Password from './bits/Password';
import Alerts from './bits/Alerts';
import controllerFactory from '../controller/controller.js';
import Context from '../../context.js';

export default {
  components: {
    Password,
    Alerts,
  },
  data: () => ({
    showForm: true,
    oldPassword: '',
    newPassword: '',
    error: '',
    success: '',
    submitting: false,
    ctx: {},
    controllerFactory: null,
    rules: {
      required: (value) => !!value || 'This field is required.',
    },
    validForm: false,
  }),
  async created () {
    this.ctx = new Context(this.$route.query);
    await this.ctx.init();
    this.controllerFactory = controllerFactory(this.ctx);
  },
  methods: {
    submit () {
      if (this.$refs.form.validate()) {
        this.submitting = true;
        this.controllerFactory.login(this.oldPassword)
          .then(() => this.controllerFactory
            .changePassword(this.oldPassword, this.newPassword))
          .then(() => {
            this.showForm = false;
            this.success = 'Your password has been successfully changed.';
          })
          .catch(this.showError)
          .finally(() => {
            this.submitting = false;
          });
      }
    },
    showError (error) {
      this.error = error.msg;
    },
  },
};
</script>
