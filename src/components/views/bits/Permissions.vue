<template>
  <v-form>
    <h1>Permissions</h1>

    <div id="appIdText">
      App <b>{{appId}}</b> is requesting:
    </div>

    <ul>
      <li v-for="(permission, index) in JSON.parse(permissionsArray)" :key="index">
      A permission on stream <b>{{permission.streamId}}</b> with level <b>{{permission.level}}</b>
      </li>
    </ul>
    
    <v-btn
    >Reject</v-btn>

    <v-btn
      @click="submit"
    >Accept</v-btn>

  </v-form>
</template>

<script>
  export default {
    props: ['permissionsArray', 'appId'],
    data: () => ({
    }),
    methods: {
      submit () {
      }
    }
  }
</script>