<template>
  <v-dialog
    v-model="dialog"
    width="600"
    persistent>
    <v-card>
      <v-card-title class="headline grey lighten-2">
        <span
          id="appIdText"
          v-html="$t('accessRequest', {appId: appId})"/>
      </v-card-title>
      <v-card-text>
        <ul>
          <li
            v-for="(permission, index) in permissionsList"
            :key="index"
            v-html="$t('newPermission',{stream: permission.name || permission.defaultName, level:permission.level.toUpperCase()})"/>
        </ul>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          id="refusePermissions"
          @click="closeDialog('refused')"
        >{{ $t('rejectAccess') }}</v-btn>
        <v-btn
          id="acceptPermissions"
          @click="closeDialog('accepted')"
        >{{ $t('acceptAccess') }}</v-btn>
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
