<template>
  <v-dialog
    v-model="dialog"
    width="600"
    persistent>
    <v-card>
      <v-card-title
        id="oauthClientIdText"
        class="headline grey lighten-2">
        <span><b>{{ clientId }}</b></span>
      </v-card-title>
      <v-card-text style="text-align:left">
        <h4>is requesting permission:</h4>
        <ul
          v-if="scope.length > 0"
          class="oauth-scope-list">
          <li
            v-for="(s, index) in scope"
            :key="s"
            class="oauth-scope-item">
            <v-checkbox
              :id="'oauthScope-' + index"
              v-model="grantedFlags[index]"
              :label="scopeLabel(s)"
              hideDetails
              class="oauth-scope-toggle"/>
          </li>
        </ul>
        <p
          v-else
          class="oauth-scope-empty">No scopes requested.</p>
        <p class="oauth-scope-hint">
          Untick to deny specific permissions; the app will receive only
          the permissions you keep ticked.
        </p>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          id="oauthRefuse"
          :disabled="submitting"
          @click="emitRefuse"
        >Reject</v-btn>
        <v-btn
          id="oauthAccept"
          :disabled="submitting"
          @click="emitAccept"
        >Accept</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    clientId: { type: String, required: true },
    scope: { type: Array, default: () => [] },
    submitting: { type: Boolean, default: false },
  },
  data: function () {
    return {
      dialog: true,
      grantedFlags: this.scope.map(() => true),
    };
  },
  watch: {
    scope: function (newScope) {
      this.grantedFlags = newScope.map(() => true);
    },
  },
  methods: {
    scopeLabel (s) {
      if (s === 'pryv:read') return 'Read your data';
      if (s === 'pryv:write') return 'Create and modify data on your behalf';
      if (s === 'pryv:manage') return 'Manage access tokens and account settings';
      return s;
    },
    grantedSubset () {
      const out = [];
      for (let i = 0; i < this.scope.length; i++) {
        if (this.grantedFlags[i]) out.push(this.scope[i]);
      }
      return out;
    },
    emitAccept () {
      this.$emit('accepted', this.grantedSubset());
    },
    emitRefuse () {
      this.$emit('refused');
    },
  },
};
</script>

<style scoped>
.oauth-scope-list { list-style: none; padding-left: 0; }
.oauth-scope-item { margin: 0.25em 0; }
.oauth-scope-toggle { margin: 0; }
.oauth-scope-hint { color: #666; font-size: 0.9em; margin-top: 0.75em; }
.oauth-scope-empty { color: #666; font-style: italic; }
</style>
