import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      signin: 'Sign in',
      register: 'Register a new user',
      pass: 'Password',
      confirmPass: 'Password confirmation',
      requirePass: 'Password is required',
      requireField: 'This field is required',
      mismatchPass: 'Password confirmation does not match',
      acceptAccess: 'Accept',
      rejectAccess: 'Reject',
      cancel: 'Cancel',
      usernameOrEmail: 'Username or email',
      helpdesk: 'Feel free to reach our Helpdesk if you have questions.',
      forgotPass: 'Forgot password',
      invalidEmail: 'E-mail address is invalid',
      notFound: '404 - Page not found',

    },
    fr: {
      signin: 'Connection',
      register: 'Créer un nouvel utilisateur',
      pass: 'Mot de passe',
      confirmPass: 'Confirmation du mot de passe',
      requirePass: 'Le mot de passe est requis',
      requireField: 'Ce champ est requis',
      mismatchPass: 'La confirmation du mot de passe a échoué',
      acceptAccess: 'Accepter',
      rejectAccess: 'Refuser',
      usernameOrEmail: 'Nom d\'utilisateur ou adresse email',
      cancel: 'Annuler',
      helpdesk: 'N\'hésitez pas à contacter notre Support si vous avez des questions.',
      forgotPass: 'Mot de passe oublié',
      invalidEmail: 'L\'addresse email est invalide',
      notFound: '404 - Page introuvable',


    },
  },
});
