<template>
  <v-form ref="form" v-model="validForm">
    <h1>{{pageTitle}}</h1>

    <v-text-field
      id="usernameOrEmail"
      label="Username or email"
      :rules="[rules.required]"
    ></v-text-field>

    <Password :confirmation="true" v-if="resetToken"></Password>

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
  import Password from './Password.vue';
  import NavigationButton from './NavigationButton.vue';

  export default {
    components: {
      Password,
      NavigationButton
    },
    props: ['resetToken'],
    data: () => ({
      rules: {
        required: value => !!value || 'This field is required.'
      },
      validForm: false
    }),
    methods: {
      submit () {
        if (this.$refs.form.validate()) {
          alert('Submit form...')
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