import Vue from 'vue';
import VueRouter from 'vue-router';
import RegisterUser from '@/components/views/RegisterUser';
import ResetPassword from '@/components/views/ResetPassword';
import Authorization from '@/components/views/Authorization';
import Context from '../Context.js';

Vue.use(VueRouter);

let Router = new VueRouter({
  routes: [
    {
      path: '/auth',
      name: 'Authorization',
      component: Authorization,
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
  // When we first open a page init the app context with query parameters
  Context.init(to.query);
  next();
});

export default Router;
