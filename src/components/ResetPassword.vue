<template>
  <v-form ref="form" v-model="validForm">
    
    <div v-if="!resetToken">
      <h1>Request password reset</h1>
      <v-text-field
        label="Username or email"
        :rules="[rules.required]"
      ></v-text-field>
      <v-btn
        @click="submit"
        :disabled="!validForm"
      >Reset password</v-btn>
    </div>

    <div v-else>
      <h1>Set a new password</h1>
      <v-text-field
        label="Username or email"
        :rules="[rules.required]"
      ></v-text-field>

      <Password :confirmation="true"></Password>
      
      <v-btn
        @click="submit"
        :disabled="!validForm"
      >Change password</v-btn>
    </div>

    <NavigationButton
      :title="'Go back to Sign in.'"
      :page="'auth'"
    ></NavigationButton>

  </v-form>
</template>

<script>
  import Password from './Password.vue'
  import NavigationButton from './NavigationButton.vue'

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
    }
  }
</script>