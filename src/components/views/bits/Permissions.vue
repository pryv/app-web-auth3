<template>
  <v-dialog
    v-model="dialog"
    width="600"
    persistent>
    <v-card>
      <v-card-title
        id="appIdText"
        class="headline grey lighten-2">
        <span>App <b>{{ appId }}</b> is requesting : </span>
      </v-card-title>
      <v-card-text>
        <ul>
          <li
            v-for="(permission, index) in permissionsList"
            :key="index">
            A permission on stream <b>{{ permission.name || permission.defaultName }}</b> with level <b>{{ permission.level.toUpperCase() }}</b>
          </li>
        </ul>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          id="refusePermissions"
          @click="closeDialog('refused')"
        >Reject</v-btn>
        <v-btn
          id="acceptPermissions"
          @click="closeDialog('accepted')"
        >Accept</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    permissionsList: {type: Array, default: () => ([])},
    appId: {type: String, default: ''},
  },
  data: () => ({
    dialog: true,
  }),
  methods: {
    closeDialog (acceptOrReject) {
      this.dialog = false;
      this.$emit(acceptOrReject);
    },
  },
};
</script>
