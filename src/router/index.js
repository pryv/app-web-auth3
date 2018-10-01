import Vue from 'vue';
import VueRouter from 'vue-router';
import RegisterUser from '@/components/views/RegisterUser';
import ResetPassword from '@/components/views/ResetPassword';
import Authorization from '@/components/views/Authorization';
import config from '../config.js';

Vue.use(VueRouter);

let Router = new VueRouter({
  routes: [
    {
      path: '/auth',
      name: 'Authorization',
      component: Authorization,
      props: (route) => ({
        permissionsArray: route.query.requestedPermissions,
        pollKey: route.query.key,
      }),
    },
    {
      path: '/register',
      name: 'RegisterUser',
      component: RegisterUser,
    },
    {
      path: '/reset',
      name: 'ResetPassword',
      component: ResetPassword,
      props: (route) => ({
        resetToken: route.query.resetToken,
      }),
    },
  ],
});

Router.beforeEach((to, from, next) => {
  if (from.name == null) {
    config.init(to.query);
  }
  next();
});

export default Router;
