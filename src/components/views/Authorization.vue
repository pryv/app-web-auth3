<template>
  <div>
    <Permissions v-if="permissionsArray && appId" :appId="appId" :permissionsArray="permissionsArray"></Permissions>

    <v-form ref="form" v-model="validForm" v-else>
      <h1>Sign in</h1>

      <v-text-field
        label="Username or email"
        :rules="[rules.required]"
      ></v-text-field>

      <Password></Password>

      <v-btn
        id="submitButton"
        @click="submit"
        :disabled="!validForm"
      >Sign In</v-btn>

      <v-btn
      >Cancel</v-btn>
      
      <NavigationButton
        :title="'Create an account'"
        :page="'register'"
      ></NavigationButton>

      <NavigationButton
        :title="'Forgot password'"
        :page="'reset'"
      ></NavigationButton>

      <div>
        Feel free to reach our
        <a target="_blank" href="https://pryv.com/helpdesk">helpdesk</a>
        if you have questions.
      </div>
    </v-form>
  </div>
</template>

<script>
  import Password from './bits/Password.vue';
  import NavigationButton from './bits/NavigationButton.vue';
  import Permissions from './bits/Permissions.vue';

  export default {
    components: {
      Password,
      NavigationButton,
      Permissions
    },
    props: ['permissionsArray', 'appId'],
    data: () => ({
      rules: {
        required: value => !!value || 'This field is required.',
        email: value => /.+@.+/.test(value) || 'E-mail must be valid'
      },
      validForm: false
    }),
    methods: {
      submit () {
        if (this.$refs.form.validate()) {
          alert('Submit form...')
        }
      }
    }
  }
</script>