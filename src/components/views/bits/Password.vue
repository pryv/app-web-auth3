<template>
  <div>
    <v-text-field
      id="password"
      label="Password"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      :append-icon="visiblePass ? 'lock_open' : 'lock'"
      @click:append="() => (visiblePass = !visiblePass)"
      :type="visiblePass ? 'text' : 'password'"
      :rules="[rules.required]"
    ></v-text-field>
    <v-text-field
      id="passConfirmation"
      label="Password confirmation"
      v-if="confirmation"
      v-model="repass"
      :type="visiblePass ? 'text' : 'password'"
      :rules="[matchPassword]"
    ></v-text-field>
  </div>
</template>

<script>
  export default {
    props: ['confirmation', 'value'],
    data: () => ({
      visiblePass: false,
      repass: '',
      rules: {
        required: value => !!value || 'Password is required.'
      }
    }),
    computed: {
      matchPassword: function () {
        return this.value === this.repass || 'Password confirmation does not match.'
      }
    }
  }
</script>