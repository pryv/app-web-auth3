<template>
  <div>
    <v-text-field
      id="password"
      :value="value"
      :appendIcon="visiblePass ? 'lock_open' : 'lock'"
      :type="visiblePass ? 'text' : 'password'"
      :rules="[rules.required]"
      :label="$t('pass')"
      @input="$emit('input', $event)"
      @click:append="() => (visiblePass = !visiblePass)"/>

    <v-text-field
      v-if="confirmation"
      id="passConfirmation"
      v-model="repass"
      :type="visiblePass ? 'text' : 'password'"
      :rules="[matchPassword]"
      :label="$t('confirmPass')"/>
  </div>
</template>

<script>
import { i18n } from '../../../locals/i18n.js';

export default {
  props: {
    confirmation: {type: Boolean, default: false},
    value: {type: String, default: ''},
  },
  data: () => ({
    visiblePass: false,
    repass: '',
    rules: {
      required: value => !!value || i18n.t('requirePass'),
    },
  }),
  computed: {
    matchPassword: function () {
      return this.value === this.repass || i18n.t('mismatchPass');
    },
  },
};
</script>
