<template>
  <div id="app">
    <head>
      <link
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons"
        rel="stylesheet">
    </head>
    <v-app>
      <v-content>
        <v-container>
          <img src="@/assets/main-logo.png">
          <router-view/>
        </v-container>
      </v-content>
    </v-app>
  </div>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    title: 'App-web-auth3',
  }),
  errorCaptured (err, vm, info) {
    alert(`[Vue warn]: Unexpected error in ${info}:
      ${err}`);
  },
};
</script>

<style>
  #app {
      font-family: 'Roboto', 'Avenir', Helvetica, Arial, sans-serif;
      text-align: center;
      padding-left: 20px;
      padding-right: 20px;
  }
  h3 {
    margin: 8px;
    display: inline;
  }
</style>
