import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      // Authorization
      signin: 'Sign in',
      accessRequest: 'App <b>{appId}</b> is requesting :',
      newPermission: 'A permission on stream <b>{stream}</b> with level <b>{level}</b>.',
      acceptAccess: 'Accept',
      rejectAccess: 'Reject',

      // Register User
      register: 'Register a new user',
      chooseHosting: 'Choose hosting',
      hosting: 'Hosting',
      createUser: 'Create user',
      userCreated: 'New user successfully created: ',

      // Reset Password
      forgotPass: 'Forgot password',
      resetPass: 'Reset password',
      requestResetPass: 'Reset',
      setNewPass: 'Set a new password',
      changePass: 'Change',
      resetInstructions: 'We have sent password reset instructions to your e-mail address.',
      passwordChanged: 'Your password have been successfully changed.',

      // Signin Hub
      newToPryv: 'New to Pryv ? Create an account',

      // Page not found
      notFound: '404 - Page not found',
      goToPryv: 'Go to my Pryv',
      signinHub: 'Signin hub',

      // Commons
      requireField: 'This field is required',
      username: 'Username',
      usernameOrEmail: 'Username or email',
      email: 'E-mail',
      invalidEmail: 'E-mail address is invalid',
      pass: 'Password',
      confirmPass: 'Password confirmation',
      requirePass: 'Password is required',
      mismatchPass: 'Password confirmation does not match',
      cancel: 'Cancel',
      reachUs1: 'Feel free to reach our',
      reachUs2: 'if you have questions.',
      clear: 'Clear form',
      terms1: 'By registering you agree with our',
      terms2: 'terms of use',
      backToSignin: 'Go back to Sign in',
    },
    fr: {
      // Authorization
      signin: 'Connection',
      accessRequest: 'L\' app <b>{appId}</b> demande :',
      newPermission: 'Une permission sur le stream <b>{stream}</b> avec le niveau d\'accès <b>{level}</b>.',
      acceptAccess: 'Accepter',
      rejectAccess: 'Refuser',

      // Register User
      register: 'Créer un nouvel utilisateur',
      chooseHosting: 'Choisir un hébergement',
      hosting: 'Hébergement',
      createUser: 'Créer',
      userCreated: 'Nouvel utilisateur créé avec succès :',

      // Reset Password
      forgotPass: 'Mot de passe oublié',
      resetPass: 'Réinitialiser le mot de passe',
      requestResetPass: 'Réinitialiser',
      setNewPass: 'Définir un nouveau mot de passe',
      changePass: 'Changer',
      resetInstructions: 'Nous avons envoyé les instructions pour la réinitialisation du mot de passe à votre adresse email.',
      passwordChanged: 'Votre mot de passe à été changé avec succès.',

      // Signin Hub
      newToPryv: 'Nouveau sur Pryv? Créez un nouveau compte',
      goToPryv: 'Aller à mon compte Pryv',
      signinHub: 'Hub de connection',

      // Page not found
      notFound: '404 - Page indisponible',

      // Commons
      requireField: 'Ce champ est requis',
      username: 'Nom d\'utilisateur',
      usernameOrEmail: 'Nom d\'utilisateur ou adresse email',
      email: 'Adresse email',
      invalidEmail: 'L\'adresse email est invalide',
      pass: 'Mot de passe',
      confirmPass: 'Confirmation du mot de passe',
      requirePass: 'Le mot de passe est requis',
      mismatchPass: 'La confirmation du mot de passe ne correspond pas',
      cancel: 'Annuler',
      reachUs1: 'N\'hésitez pas à contacter notre',
      reachUs2: 'si vous avez des questions.',
      clear: 'Effacer',
      terms1: 'En vous enregistrant, vous acceptez nos',
      terms2: 'termes et conditions.',
      backToSignin: 'Revenir à la page de connection',
    },
  },
});
