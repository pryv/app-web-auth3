<template>
  <div>
    <v-text-field
      id="password"
      :value="value"
      :appendIcon="visiblePass ? 'lock_open' : 'lock'"
      :type="visiblePass ? 'text' : 'password'"
      :rules="[rules.required]"
      label="Password"
      @input="$emit('input', $event)"
      @click:append="() => (visiblePass = !visiblePass)"/>

    <v-text-field
      v-if="confirmation"
      id="passConfirmation"
      v-model="repass"
      :type="visiblePass ? 'text' : 'password'"
      :rules="[matchPassword]"
      label="Password confirmation"/>
  </div>
</template>

<script>
export default {
  props: {
    confirmation: {type: Boolean, default: false},
    value: {type: String, default: ''},
  },
  data: () => ({
    visiblePass: false,
    repass: '',
    rules: {
      required: value => !!value || 'Password is required.',
    },
  }),
  computed: {
    matchPassword: () => {
      return this.value === this.repass || 'Password confirmation does not match.';
    },
  },
};
</script>
