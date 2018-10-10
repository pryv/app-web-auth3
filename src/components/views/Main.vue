<template>
  <div>

    <img src="@/assets/main-logo.png">

    <Authorization
      v-if="currentPage==='auth'"
      :appId="requestingAppId"
      :returnURL="returnURL"
      :oauthState="oauthState"
      :permissionsString="requestedPermissions"
      :pollKey="key"
      :domain="domain"/>

    <Register
      v-if="currentPage==='reg'"
      :domain="domain"
      :appId="requestingAppId"
      :page="currentPage"
      @end="goTo"/>

    <Reset
      v-if="currentPage==='reset'"
      :domain="domain"
      :appId="requestingAppId"
      :resetToken="resetToken"/>

    <div v-if="currentPage==='auth'">
      <v-btn
        id="goToReg"
        @click="goTo('reg')"
      >Go to register</v-btn>

      <v-btn
        id="goToReset"
        @click="goTo('reset')"
      >Go to reset</v-btn>
    </div>

    <v-btn
      v-if="currentPage!=='auth'"
      @click="goTo('auth')"
    >Go to auth</v-btn>

  </div>
</template>

<script>
import Authorization from './Authorization.vue';
import Register from './RegisterUser.vue';
import Reset from './ResetPassword.vue';

export default {
  components: {
    Authorization,
    Register,
    Reset,
  },
  props: {
    domain: {type: String, default: 'pryv.me'},
    requestingAppId: {type: String, default: 'app-web-auth'},
    lang: {type: String, default: 'en'},
    oauthState: {type: String, default: null},
    requestedPermissions: {type: String, default: null},
    key: {type: String, default: null},
    resetToken: {type: String, default: null},
    returnURL: {type: String, default: null},
  },
  data: () => ({
    currentPage: 'auth',
  }),
  methods: {
    goTo (page) {
      this.currentPage = page;
    },
  },
};
</script>
