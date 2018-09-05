<template>
  <v-form ref="form" v-model="validForm">
    <h1>Register a new user</h1>

    <v-text-field
      label="E-mail"
      :rules="[rules.required, rules.email]"
    ></v-text-field>

    <v-text-field
      label="Username"
      :rules="[rules.required]"
    ></v-text-field>
    
    <Password :confirmation="true"></Password>

    <v-autocomplete
      label="Hosting"
      :items="hosts"
      placeholder="Choose where to store your data..."
      :rules="[rules.required]"
    ></v-autocomplete>
    
    <div>
      By registering you agree with our
      <a target="_blank" href="https://pryv.com/terms-of-use/">terms of use</a>.
    </div>
    
    <v-btn
      @click="submit"
      :disabled="!validForm"
    >Submit</v-btn>

    <v-btn
      @click="clear"
    >Clear</v-btn>

    <NavigationButton
      :title="'Already a Pryv user ? Sign in.'"
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
    data: () => ({
      hosts: [ 'EU', 'US', 'ASIA' ],
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
      },
      clear () {
        this.$refs.form.reset()
      }
    }
  }
</script>