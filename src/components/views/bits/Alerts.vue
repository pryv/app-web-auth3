<template>
  <div>
    <v-alert
      :value="errorMsg"
      type="error"
      transition="scale-transition"
    >{{ errorMsg }}</v-alert>
    <v-alert
      :value="successMsg"
      type="success"
      transition="scale-transition"
    >{{ successMsg }}</v-alert>
  </div>
</template>

<script>

export default {
  props: {
    errorMsg: {type: String, default: ''},
    successMsg: {type: String, default: ''},
  },
};
</script>
