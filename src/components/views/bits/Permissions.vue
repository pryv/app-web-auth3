<template>
  <v-dialog
    v-model="dialog"
    width="600"
    persistent>
    <v-card>
      <v-card-title
        id="appIdText"
        class="headline grey lighten-2">
        <span><b>{{ appId }}</b></span>
      </v-card-title>
      <v-card-text style="text-align:left">
        <h4>is requesting permission to:</h4>
        <ul>
          <li
            v-for="(permission, index) in permissionsList"
            :key="index">
            to {{ permission.level.toLowerCase() }} <u>{{ permission.streamId === '*' ? '* (all data)' : permission.name || permission.defaultName }}</u>
          </li>
        </ul>
        <span
          v-if="expireMsg" 
          style="text-align:left">
          <b>Will expire after:</b> {{ expireMsg }}s
        </span>
        <br>
        <span
          v-if="consentMsg"
          v-html="consentMsg"/>
      </v-card-text>
      <v-alert
        v-if="accessMismatchMsg"
        :value="accessMismatchMsg"
        :type="alertType"
        transition="scale-transition">
        <span v-html="accessMismatchMsg"/>
      </v-alert>
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
    ctx: { type: Object, default: () => {} },
  },
  data: () => ({
    dialog: true,
    appId: null,
    permissionsList: null,
  }),

  computed: {
    consentMsg: function () {
      if (this.ctx.accessState.clientData != null) {
        const description = this.ctx.accessState.clientData['app-web-auth:description'];
        return description != null ? marked(description.content) : '';
      }
    },
    accessMismatchMsg: function () {
      if (this.ctx.checkAppResult.mismatchingAccess != null) {
        return 'A different access was already given to this app. Do you want to replace it?';
      }
    },
    expireMsg: function () {
      return 20000;
      if (this.ctx.accessState.expireAfter != null) {
        return 'Expire After: ' + this.ctx.accessState.expireAfter + ' s';
      }
    },
  },
  created: function () {
    this.appId = this.ctx.accessState.requestingAppId;
    this.permissionsList = this.ctx.accessState.requestedPermissions;
  },
  methods: {
    closeDialog (acceptOrReject) {
      this.dialog = false;
      this.$emit(acceptOrReject);
    },
  },
};
</script>
