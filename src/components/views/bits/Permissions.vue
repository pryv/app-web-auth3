<template>
  <v-form>
    <h1>Permissions</h1>

    <div id="appIdText">
      App <b>{{ appId }}</b> is requesting:
    </div>

    <ul>
      <li
        v-for="(permission, index) in permissionsList"
        :key="index">
        A permission on stream <b>{{ permission.streamId }}</b> with level <b>{{ permission.level }}</b>
      </li>
    </ul>

    <div v-if="clientData.consentMsg">
      {{ clientData.consentMsg }}
    </div>

    <v-btn
      id="refusePermissions"
      @click="refuse"
    >Reject</v-btn>

    <v-btn
      id="acceptPermissions"
      @click="accept"
    >Accept</v-btn>

  </v-form>
</template>

<script>
export default {
  props: {
    permissionsList: {type: Array, default: () => ([])},
    appId: {type: String, default: ''},
    accept: {type: Function, default: () => {}},
    refuse: {type: Function, default: () => {}},
    clientData: {type: Object, default: () => ({})},
  },
};
</script>
