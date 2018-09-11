<template>
    <v-btn
      id="navButton"
      @click="goTo(page)"
    >{{title}}</v-btn>
</template>
<script>
  export default {
    props: ['title', 'page'],
    methods: {
      goTo (page) {
        this.$router.push(page)
      }
    }
  }
</script>