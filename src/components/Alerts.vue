<template>
  <v-alert
    :value="alert"
    type="success"
    transition="scale-transition"
  >Alert!</v-alert>
</template>

<script>
  export default {
    data: () => ({
      alert: false
    })
  }
</script>