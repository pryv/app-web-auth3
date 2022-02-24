<template>
  <v-dialog
    v-model="dialog"
    width="600"
    persistent>
    <v-card>
      <v-card-title
        id="appIdText"
        class="headline grey lighten-2">
        <span><b>{{ accessState.requestingAppId }}</b></span>
      </v-card-title>
      <v-card-text style="text-align:left">
        <h4>Is requesting permission:</h4>
        <ul>
          <li
            v-for="(permission, index) in accessState.requestedPermissions"
            :key="index">
            to {{ permission.level.toLowerCase() }} <u>{{ permission.streamId === '*' ? '* (all data)' : permission.name || permission.defaultName }}</u>
          </li>
        </ul>
        <span
          v-if="expire"
          style="text-align:left">
          <b>will expire after:</b> {{ accessState.expireAfter }}s
        </span>
        <br>
        <span
          v-if="consentMsg"
          v-html="consentMsg"/>
      </v-card-text>
      <v-alert
        v-if="accessMismatch"
        :value="accessMismatch"
        :type="alertType"
        transition="scale-transition"
        style="text-align:left">
        <b>A different access was already given to this app. Do you want to replace it?</b>
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
import { marked } from 'marked';
export default {
  props: {
    ctx: { type: Object, default: () => {} },
  },
  data: () => ({
    dialog: true,
    accessState: null,
    checkAppResult: null,
  }),

  computed: {
    consentMsg: function () {
      if (this.ctx.accessState.clientData != null) {
        const description = this.ctx.accessState.clientData['app-web-auth:description'];
        return description != null ? marked.parse(description.content) : '';
      } else {
        return null;
      }
    },
    accessMismatch: function () {
      return (this.ctx.checkAppResult.mismatchingAccess != null);
    },
    expire: function () {
      return (this.ctx.accessState.expireAfter != null);
    },
  },
  created: function () {
    this.accessState = this.ctx.accessState;
    this.checkAppResult = this.ctx.checkAppResult;
  },
  methods: {
    closeDialog (acceptOrReject) {
      this.dialog = false;
      this.$emit(acceptOrReject);
    },
  },
};
</script>
