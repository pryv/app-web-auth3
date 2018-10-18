<template>
  <div>
    <v-divider class="mt-3 mb-2"/>
    <v-alert
      :value="alertMsg"
      :type="alertType"
      transition="scale-transition">
      <span v-html="alertMsg"/>
    </v-alert>
  </div>
</template>

<script>
export default {
  props: {
    errorMsg: {type: String, default: ''},
    successMsg: {type: String, default: ''},
  },
  computed: {
    alertMsg: function () {
      if (this.successMsg.length > 0) return this.successMsg;
      if (this.errorMsg.length > 0) return this.errorMsg;
      return '';
    },
    alertType: function () {
      return this.successMsg.length > 0 ? 'success' : 'error';
    },
  },
};
</script>
