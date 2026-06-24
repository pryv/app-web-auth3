<template>
  <v-dialog
    v-model="dialog"
    width="600"
    persistent>
    <v-card>
      <v-card-title class="headline grey lighten-2">
        <span id="cmcRequesterId">
          <b>{{ requesterLabel }}</b>
          <small
            v-if="appLabel"
            class="cmc-app-label"> · {{ appLabel }}</small>
        </span>
      </v-card-title>
      <v-card-text style="text-align:left">
        <p
          v-if="title"
          id="cmcOfferTitle"
          class="cmc-offer-title">
          <b>{{ title }}</b>
        </p>
        <p
          v-if="description"
          id="cmcOfferDescription"
          class="cmc-offer-description">
          {{ description }}
        </p>
        <h4>Is requesting permission:</h4>
        <ul id="cmcOfferPermissions">
          <li
            v-for="(p, i) in permissions"
            :key="i">
            to <b>{{ levelLabel(p.level) }}</b>
            <u>{{ p.streamId === '*' ? '* (all data)' : (p.name || p.defaultName || p.streamId) }}</u>
          </li>
        </ul>
        <p
          v-if="consentMessage"
          id="cmcOfferConsent"
          class="cmc-offer-consent">
          <i>{{ consentMessage }}</i>
        </p>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          id="cmcRefuse"
          :disabled="submitting"
          @click="emitRefuse"
        >Refuse</v-btn>
        <v-btn
          id="cmcAccept"
          :disabled="submitting"
          color="primary"
          @click="emitAccept"
        >Accept</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
// The CMC offer event content shape (see open-pryv.io
// components/cmc/IMPLEMENTERS-GUIDE.md Step 3 "Recipient sees the offer"):
//   {
//     request: {
//       title: { en: '...' } | string,
//       description: { en: '...' } | string,
//       consent: { en: 'I consent...' } | string,
//       permissions: [{ streamId, level, name?, defaultName? }, ...]
//     },
//     requesterMeta: { username, host, appId },
//   }
//
// Localized i18n strings come as `{ <lang>: <text> }` maps with English
// as the de-facto fallback. Until i18n lands here, just pick the
// `en` slot or use the string verbatim.

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
    offer: { type: Object, required: true },
    submitting: { type: Boolean, default: false },
  },
  data: () => ({ dialog: true }),
  computed: {
    request () { return (this.offer && this.offer.request) || {}; },
    permissions () {
      const ps = this.request.permissions;
      return Array.isArray(ps) ? ps : [];
    },
    title () { return pickLocalized(this.request.title); },
    description () { return pickLocalized(this.request.description); },
    consentMessage () { return pickLocalized(this.request.consent); },
    requesterLabel () {
      const meta = (this.offer && this.offer.requesterMeta) || {};
      const username = meta.username || '(unknown)';
      const host = meta.host || '';
      return host ? username + '@' + host : username;
    },
    appLabel () {
      const meta = (this.offer && this.offer.requesterMeta) || {};
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
.cmc-app-label { color: #666; font-weight: 400; }
.cmc-offer-title { font-size: 1.1em; margin-bottom: 0.5em; }
.cmc-offer-description { margin-bottom: 1em; }
.cmc-offer-consent { margin-top: 1em; color: #444; }
</style>
