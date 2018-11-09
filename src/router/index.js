import Vue from 'vue';
import VueRouter from 'vue-router';
import RegisterUser from '@/components/views/RegisterUser';
import ResetPassword from '@/components/views/ResetPassword';
import Authorization from '@/components/views/Authorization';
import PageNotFound from '@/components/views/PageNotFound';
import SigninHub from '@/components/views/SigninHub';
import {i18n} from '../locals/i18n.js';

Vue.use(VueRouter);

let Router = new VueRouter({
  mode: 'history',
  base: 'access',
  routes: [
    {
      path: '/',
      redirect: {name: 'Authorization'},
    },
    {
      path: '/auth',
      name: 'Authorization',
      component: Authorization,
      alias: '/access.html',
    },
    {
      path: '/register',
      name: 'RegisterUser',
      component: RegisterUser,
      alias: '/register.html',
    },
    {
      path: '/reset',
      name: 'ResetPassword',
      component: ResetPassword,
      props: (route) => ({
        resetToken: route.query.resetToken,
      }),
      alias: '/reset-password.html',
    },
    {
      path: '/signin',
      name: 'SigninHub',
      component: SigninHub,
      alias: '/signinhub.html',
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
  // Adapt language if needed
  const requestedLang = to.query.lang;
  if (requestedLang != null && i18n.locale !== requestedLang) {
    i18n.locale = requestedLang;
  }

  if (!hasQueryParams(to) && hasQueryParams(from)) {
    // Persist query parameters between pages
    next({name: to.name, query: from.query});
  } else {
    next();
  }
});

export default Router;
