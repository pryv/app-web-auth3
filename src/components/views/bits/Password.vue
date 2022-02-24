<template>
  <div>
    <v-text-field
      :id="id"
      :value="value"
      :appendIcon="visiblePass ? 'lock_open' : 'lock'"
      :type="visiblePass ? 'text' : 'password'"
      :rules="[rules.required]"
      :label="label"
      @input="$emit('input', $event)"
      @click:append="() => (visiblePass = !visiblePass)"/>

    <v-text-field
      v-if="confirmation"
      :id="`${id}Confirmation`"
      v-model="repass"
      :type="visiblePass ? 'text' : 'password'"
      :rules="[matchPassword]"
      :label="`${label} confirmation`"/>
  </div>
</template>

<script>
export default {
  props: {
    confirmation: { type: Boolean, default: false },
    value: { type: String, default: '' },
    label: { type: String, default: 'Password' },
    id: { type: String, default: 'password' },
  },
  data: () => ({
    visiblePass: false,
    repass: '',
    rules: {
      required: value => !!value || 'Password is required.',
    },
  }),
  computed: {
    matchPassword: function () {
      return this.value === this.repass || 'Password confirmation does not match.';
    },
  },
};
</script>
