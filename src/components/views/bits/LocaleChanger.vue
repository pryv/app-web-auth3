<template>
  <div class="LocaleChanger">
    <select v-model="$i18n.locale">
      <option
        v-for="(lang, i) in langs"
        :key="`Lang${i}`"
        :value="lang">{{ $t('lang',lang) }}
      </option>
    </select>
  </div>
</template>

<script>

import i18n from '../../../i18n';
export default {
  name: 'LocaleChanger',
  data () {
    return { langs: i18n.availableLocales };
  },
};
</script>
