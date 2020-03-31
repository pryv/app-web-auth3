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
            A permission on stream <b>{{ permission.streamId === '*' ? '* (all my Pryv)' : permission.name || permission.defaultName }}</b> with level <b>{{ permission.level.toUpperCase() }}</b>
          </li>
        </ul>
      </v-card-text>
      <v-card-text v-html="consentMsg"/>
      <v-card-text v-html="expireMsg"/>
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
import marked from 'marked';
export default {
  props: {
    permissionsList: {type: Array, default: () => ([])},
    appId: {type: String, default: ''},
    clientData: {type: Object, default: () => {}},
  },
  data: () => ({
    dialog: true,
  }),
  computed: {
    consentMsg: function () {
      if (this.clientData != null) {
        const description = this.clientData['app-web-auth:description'];
        return description != null ? marked(description.content) : '';
      }
    },
    expireAfter: function () {
      if (this.expireAfter != null) {
        const description = 'Expire After: ' + this.expireAfter + ' s';
        return description != null ? marked(description.content) : '';
      }
    },
  },
  methods: {
    closeDialog (acceptOrReject) {
      this.dialog = false;
      this.$emit(acceptOrReject);
    },
  },
};
</script>
