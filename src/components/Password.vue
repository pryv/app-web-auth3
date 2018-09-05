<template>
  <div>
    <v-text-field
      label="Password"
      v-model="password"
      :append-icon="visiblePass ? 'lock_open' : 'lock'"
      @click:append="() => (visiblePass = !visiblePass)"
      :type="visiblePass ? 'text' : 'password'"
      :rules="[rules.required]"
    ></v-text-field>
    <v-text-field
      label="Password confirmation"
      v-if="confirmation"
      v-model="repass"
      :append-icon="visibleRepass ? 'lock_open' : 'lock'"
      @click:append="() => (visibleRepass = !visibleRepass)"
      :type="visibleRepass ? 'text' : 'password'"
      :rules="[matchPassword]"
    ></v-text-field>
  </div>
</template>

<script>
  export default {
    props: ['confirmation'],
    data: () => ({
      visiblePass: false,
      visibleRepass: false,
      password: '',
      repass: '',
      rules: {
        required: value => !!value || 'Password is required.'
      }
    }),
    computed: {
      matchPassword: function () {
        return this.password === this.repass || 'Password confirmation does not match.'
      }
    }
  }
</script>