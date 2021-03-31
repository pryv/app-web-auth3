import Vue from 'vue';
import i18n from '../i18n';
import VueRouter from 'vue-router';
import RegisterUser from '@/components/views/RegisterUser';
import ResetPassword from '@/components/views/ResetPassword';
import Authorization from '@/components/views/Authorization';
import PageNotFound from '@/components/views/PageNotFound';
import SigninHub from '@/components/views/SigninHub';
import ChangePassword from '@/components/views/ChangePassword';
import Aliases from './aliases.js';

Vue.use(VueRouter);

const path = (new URL(document.location)).pathname;
const basePath = path.substring(0, path.lastIndexOf('/access/')) + '/' + Aliases.basePath;

let Router = new VueRouter({
  i18n,
  mode: 'history',
  base: basePath,
  routes: [
    {
      path: '/',
      redirect: {name: 'Authorization'},
    },
    {
      path: '/auth',
      name: 'Authorization',
      component: Authorization,
      alias: Aliases.pages.auth,
    },
    {
      path: '/register',
      name: 'RegisterUser',
      component: RegisterUser,
      alias: Aliases.pages.register,
    },
    {
      path: '/reset',
      name: 'ResetPassword',
      component: ResetPassword,
      props: (route) => ({
        resetToken: route.query.resetToken,
      }),
      alias: Aliases.pages.reset,
    },
    {
      path: '/signin',
      name: 'SigninHub',
      component: SigninHub,
      alias: Aliases.pages.signin,
    },
    {
      path: '/change-password',
      name: 'ChangePassword',
      component: ChangePassword,
      alias: Aliases.pages.changepass,
    },
    {
      path: '*',
      component: PageNotFound,
    },
  ],
});

function hasQueryParams (route) {
  return !!Object.keys(route.query).length;
}

Router.beforeEach((to, from, next) => {
  if (!hasQueryParams(to) && hasQueryParams(from)) {
    // Persist query parameters between pages
    next({ name: to.name, query: from.query });
  } else {
    next();
  }
});

export default Router;
