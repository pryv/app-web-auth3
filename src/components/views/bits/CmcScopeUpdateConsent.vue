<template>
  <v-dialog
    v-model="dialog"
    width="600"
    persistent>
    <v-card>
      <v-card-title class="headline grey lighten-2">
        <span id="cmcSuRequesterId">
          <b>{{ requesterLabel }}</b>
          <small
            v-if="appLabel"
            class="cmc-su-app-label"> · {{ appLabel }}</small>
        </span>
      </v-card-title>
      <v-card-text style="text-align:left">
        <p class="cmc-su-intro">
          The collector is proposing a scope change to your existing data-grant.
        </p>
        <h4>New requested permissions:</h4>
        <ul id="cmcSuNewPermissions">
          <li
            v-for="(p, i) in newPermissions"
            :key="i">
            to <b>{{ levelLabel(p.level) }}</b>
            <u>{{ p.streamId === '*' ? '* (all data)' : (p.name || p.defaultName || p.streamId) }}</u>
          </li>
        </ul>
        <h4
          v-if="previousPermissions.length > 0"
          class="cmc-su-previous-heading">
          Replacing:
        </h4>
        <ul
          v-if="previousPermissions.length > 0"
          id="cmcSuPreviousPermissions"
          class="cmc-su-previous">
          <li
            v-for="(p, i) in previousPermissions"
            :key="i">
            {{ levelLabel(p.level) }}
            <u>{{ p.streamId === '*' ? '* (all data)' : (p.name || p.defaultName || p.streamId) }}</u>
          </li>
        </ul>
        <p
          v-if="message"
          id="cmcSuMessage"
          class="cmc-su-message">
          <i>{{ message }}</i>
        </p>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          id="cmcSuRefuse"
          :disabled="submitting"
          @click="emitRefuse"
        >Refuse</v-btn>
        <v-btn
          id="cmcSuAccept"
          :disabled="submitting"
          color="primary"
          @click="emitAccept"
        >Accept new scope</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
// The CMC scope-request event content shape (see open-pryv.io
// components/cmc/IMPLEMENTERS-GUIDE.md "Step 3b — Provider proposes a
// scope change"):
//   {
//     newPermissions: [{ streamId, level, name?, defaultName? }, ...],
//     previousPermissions: [{ ... }, ...],   // optional
//     message: { en: '...' } | string,        // optional
//     requesterMeta: { username, host, appId } // optional — usually the requester
//   }

function pickLocalized (value, locale = 'en') {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value[locale]) return value[locale];
  const firstKey = Object.keys(value)[0];
  return firstKey ? value[firstKey] : '';
}

const LEVEL_LABELS = {
  read: 'read',
  contribute: 'contribute to',
  manage: 'manage',
  'create-only': 'create entries in',
};

export default {
  props: {
    scopeRequest: { type: Object, required: true },
    submitting: { type: Boolean, default: false },
  },
  data: () => ({ dialog: true }),
  computed: {
    content () { return (this.scopeRequest && this.scopeRequest.content) || {}; },
    newPermissions () {
      const ps = this.content.newPermissions;
      return Array.isArray(ps) ? ps : [];
    },
    previousPermissions () {
      const ps = this.content.previousPermissions;
      return Array.isArray(ps) ? ps : [];
    },
    message () { return pickLocalized(this.content.message); },
    requesterLabel () {
      const meta = (this.scopeRequest && this.scopeRequest.requesterMeta) ||
        (this.content && this.content.requesterMeta) || {};
      const username = meta.username || '(collector)';
      const host = meta.host || '';
      return host ? username + '@' + host : username;
    },
    appLabel () {
      const meta = (this.scopeRequest && this.scopeRequest.requesterMeta) ||
        (this.content && this.content.requesterMeta) || {};
      return meta.appId || '';
    },
  },
  methods: {
    levelLabel (level) { return LEVEL_LABELS[level] || level; },
    emitAccept () { this.$emit('accepted'); },
    emitRefuse () { this.$emit('refused'); },
  },
};
</script>

<style scoped>
.cmc-su-app-label { color: #666; font-weight: 400; }
.cmc-su-intro { margin-bottom: 1em; }
.cmc-su-previous-heading { margin-top: 1em; }
.cmc-su-previous { color: #888; }
.cmc-su-message { margin-top: 1em; color: #444; }
</style>
