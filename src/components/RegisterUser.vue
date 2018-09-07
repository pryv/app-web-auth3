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
  import Password from './Password.vue';
  import NavigationButton from './NavigationButton.vue';
  import axios from 'axios';

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
      errors: [],
      rules: {
        required: value => !!value || 'This field is required.',
        email: value => /.+@.+/.test(value) || 'E-mail must be valid'
      },
      validForm: false
    }),
    created() {
      axios.get(`https://reg.pryv.me/hostings`)
      .then(response => {
        const regions = response.data.regions;
        Object.keys(regions).forEach(region => {
          const zones = regions[region].zones;
          Object.keys(zones).forEach(zone => {
            this.hosts.push(zones[zone].name);
          });
        });
      })
      .catch(e => {
        console.log(e)
      })
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